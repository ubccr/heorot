import { Box, Grid, Icon, IconButton } from "@mui/material"

import DataDisplay from "./components/DataDisplay"
import { Link } from "react-router-dom"
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew"
import React from "react"
import StorageIcon from "@mui/icons-material/Storage"
import formatReadable from "../../components/formatReadable"

const Node = ({ node }) => {
  // default display for faild queries
  if (node.redfish?.success === false || node.redfish?.success === undefined)
    return (
      <Box sx={{ width: "100%" }}>
        <Link to={`/Node/${node.grendel.name}`}>{node.grendel.name}</Link>
      </Box>
    )

  let powerColor = node.redfish.power_state === "On" ? "success" : "error"

  let biosColor = "default"
  let latest_bios_int = parseInt(node.latest_bios.replace(/\./g, "")) ?? 0
  let bios_int = parseInt(node.redfish.bios_version?.replace(/\./g, "")) ?? 0

  if (latest_bios_int <= bios_int) biosColor = "success"
  else if (latest_bios_int > bios_int && bios_int !== 0) biosColor = "warning"

  let bmcColor = "default"
  let latest_bmc_int = parseInt(node.latest_bmc.replace(/\./g, "")) ?? 0
  let bmc_int = parseInt(node.redfish.bmc.version?.replace(/\./g, "")) ?? 0

  if (latest_bmc_int <= bmc_int) bmcColor = "success"
  else if (latest_bmc_int > bmc_int && bmc_int !== 0) bmcColor = "warning"

  let node_info = [
    { name: "", data: node.redfish.model, bColor: "default", tooltip: "" },
    { name: "", data: node.redfish.service_tag, bColor: "default", tooltip: "" },
    {
      name: "BIOS:",
      data: node.redfish.bios_version,
      bColor: biosColor,
      tooltip: `Latest: ${node.latest_bios}`,
    },
    { name: "BMC:", data: node.redfish.bmc.version, bColor: bmcColor, tooltip: `Latest: ${node.latest_bmc}` },
  ]

  let memory = {
    titleArr: [
      { name: "Speed:", data: node.redfish.memory.speed_MhZ },
      { name: "Status:", data: node.redfish.memory.status },
      { name: "Non-Volatile:", data: formatReadable(node.redfish.memory.total_NV_size_MiB, 0, "MB") },
      { name: "Volatile:", data: formatReadable(node.redfish.memory.total_V_size_MiB, 0, "MB") },
    ],
    icon: <i className="bi bi-memory" style={{ marginLeft: "5px", fontSize: "12pt" }} />,
    color: statusColor(node.redfish.memory.status),
    label: formatReadable(node.redfish.memory.total_size_MiB, 0, "MB"),
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={4}>
              <IconButton color={powerColor} small="small" sx={{ float: "left", height: "25px", width: "25px" }}>
                <PowerSettingsNewIcon sx={{ height: "20px", width: "20px" }} />
              </IconButton>
            </Grid>

            <Grid item xs={4}>
              <Link to={`/Node/${node.grendel.name}`}>{node.grendel.name}</Link>
            </Grid>

            <Grid item xs={4} sx={{ display: "flex", justifyContent: "end", gap: "3px" }}>
              {node.redfish.network !== undefined &&
                node.redfish.network.map((adapter, index) => (
                  <Box key={index} sx={{ marginRight: "3px", gap: "1px", display: "flex" }}>
                    {adapter.ports.map((val, index) => {
                      let color = "border.secondary"
                      let bColor = "default"
                      let speed = val.speed ?? "0"

                      if (val.speed === 100000) {
                        bColor = "info"
                        speed = "100 GbE"
                      } else if (val.speed === 40000) {
                        bColor = "error"
                        speed = "40 GbE"
                      } else if (val.speed === 10000) {
                        bColor = "primary"
                        speed = "10 GbE"
                      } else if (val.speed === 1000) {
                        bColor = "success"
                        speed = "1 GbE"
                      } else if (val.speed === 100) {
                        bColor = "warning"
                        speed = "100 MbE"
                      }

                      let titleArr = [
                        { name: "Port:", data: val.port },
                        { name: "NIC:", data: val.id },
                        { name: "Type:", data: val.type },
                        { name: "MAC:", data: val.mac },
                        { name: "Speed:", data: speed },
                        { name: "Status:", data: val.status },
                      ]

                      if (val.link === "Up") color = "border.table.double"

                      let icon = (
                        <Icon fontSize="small" sx={{ color: "white" }}>
                          <i className=" bi-ethernet" />
                        </Icon>
                      )
                      if (val.type === "InfiniBand")
                        icon = (
                          <Icon fontSize="small" sx={{ color: "white" }}>
                            <i className=" bi-info-square" />
                          </Icon>
                        )
                      return (
                        <DataDisplay
                          type="avatar"
                          titleArr={titleArr}
                          icon={icon}
                          color={bColor}
                          backgroundColor={color}
                          key={index}
                        />
                      )
                    })}
                  </Box>
                ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={12 / node.width}
          sx={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap" }}
        >
          {node_info !== undefined &&
            node_info.map((val, index) => {
              return (
                <DataDisplay
                  titleArr={val.tooltip}
                  icon={val.icon}
                  color={val.bColor}
                  label={`${val.name} ${val.data}`}
                  key={index}
                />
              )
            })}
          {node.grendel.tags.sort().map((val, index) => (
            <DataDisplay titleArr={""} color={"primary"} label={val} key={index} />
          ))}
        </Grid>
        <Grid
          item
          xs={12}
          md={12 / node.width}
          sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Box>
            {node.redfish.processor.processors !== undefined &&
              node.redfish.processor.processors.map((val, index) => {
                let icon = <i className="bi bi-cpu" style={{ marginLeft: "5px", fontSize: "12pt" }} />
                let titleArr = [
                  { name: "Model:", data: val.model },
                  { name: "Architecture:", data: val.architecture },
                  { name: "Cores:", data: val.total_cores },
                  { name: "Threads:", data: val.total_threads },
                  { name: "Max Frequency:", data: val.max_frequency },
                ]
                return (
                  <DataDisplay
                    titleArr={titleArr}
                    icon={icon}
                    color={statusColor(val.status)}
                    label="CPU"
                    key={index}
                  />
                )
              })}
            <DataDisplay titleArr={memory.titleArr} icon={memory.icon} color={memory.color} label={memory.label} />
            {node.redfish.gpus !== undefined &&
              node.redfish.gpus.map((val, index) => {
                let icon = <i className="bi bi-gpu-card" style={{ marginLeft: "5px", fontSize: "12pt" }} />
                let titleArr = [
                  { name: "Model:", data: val.model },
                  { name: "Manufacturer:", data: val.manufacturer },
                  { name: "Status:", data: val.status },
                ]
                return (
                  <DataDisplay
                    titleArr={titleArr}
                    icon={icon}
                    color={statusColor(val.status)}
                    label="GPU"
                    key={index}
                  />
                )
              })}
            {node.redfish.pcie !== undefined &&
              node.redfish.pcie.map((val, index) => {
                let icon = <i className="bi bi-pci-card" style={{ marginLeft: "5px", fontSize: "12pt" }} />
                let titleArr = [
                  { name: "Status:", data: val.status },
                  { name: "Manufacturer:", data: val.manufacturer },
                  { name: "Name:", data: val.model },
                ]
                return (
                  <DataDisplay
                    titleArr={titleArr}
                    icon={icon}
                    color={statusColor(val.status)}
                    label="PCI Card"
                    key={index}
                  />
                )
              })}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap" }}>
            {node.redfish.storage.map((val) => {
              return val.volumes.map((vol, index) => {
                let icon = <StorageIcon fontSize="small" />

                let titleArr = [
                  { name: "Name:", data: vol.name },
                  { name: "Description:", data: vol.description },
                  { name: "Volume Type:", data: vol.volume_type },
                  { name: "RAID Type:", data: vol.raid_type },
                ]

                return (
                  <DataDisplay
                    titleArr={titleArr}
                    icon={icon}
                    color={statusColor(vol.status)}
                    label={`${formatReadable(vol.capacity)} - ${vol.raid_type ?? vol.volume_type}`}
                    key={index}
                  />
                )
              })
            })}
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

const statusColor = (status) => {
  //TODO: need to find error name
  if (status === "OK") return "success"
  else if (status === "Warning") return "warning"
  else return "default"
}

export default Node
