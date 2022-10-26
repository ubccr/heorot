import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Grid,
  Icon,
  IconButton,
  Table,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"

import DataDisplay from "./components/DataDisplay"
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew"
import React from "react"
import Storage from "./Storage"
import StorageIcon from "@mui/icons-material/Storage"

const Node = ({ node }) => {
  let powerColor = node.redfish.power_state === "On" ? "success" : "error"
  if (node.redfish.status === "error") return <div>{node.grendel[0].name}</div>

  let biosColor = "default"
  if (node.latest_bios === node.redfish.bios_version) biosColor = "success"
  else if (node.latest_bios !== node.redfish.bios_version && node.latest_bios !== "") biosColor = "warning"

  let bmcColor = "default"
  if (node.latest_bmc === node.redfish.bmc.version) bmcColor = "success"
  else if (node.latest_bmc !== node.redfish.bmc.version && node.latest_bmc !== "") bmcColor = "warning"

  let address_source_color = "default"
  if (node.redfish.bmc.addresses.type === "Static") address_source_color = "error"

  let node_info = [
    { name: "", data: node.redfish.model, bColor: "default", tooltip: "" },
    { name: "", data: node.redfish.service_tag, bColor: "default", tooltip: "" },
    {
      name: "BIOS Version:",
      data: node.redfish.bios_version,
      bColor: biosColor,
      tooltip: `Latest: ${node.latest_bios}`,
    },
    {
      name: "BMC Address:",
      data: node.redfish.bmc.addresses.ip,
      bColor: address_source_color,
      tooltip: `Source: ${node.redfish.bmc.addresses.type}`,
    },
    { name: "BMC Version:", data: node.redfish.bmc.version, bColor: bmcColor, tooltip: `Latest: ${node.latest_bmc}` },
    { name: "BMC DNS:", data: node.redfish.bmc.dns.join(", "), bColor: "default", tooltip: "" },
    {
      name: "Memory:",
      data: `${node.redfish.memory.size} ${node.redfish.memory.speed}`,
      bColor: statusColor(node.redfish.memory.status),
      tooltip: "",
    },
  ]
  if (node.redfish.bmc.vlan != 1)
    node_info.push({ name: "BMC vlan:", data: node.redfish.bmc.vlan, bColor: "default", tooltip: "" })
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {node.grendel[0].name}
          <PowerSettingsNewIcon color={powerColor} sx={{ float: "right" }} />
        </Grid>

        {node_info.map((val, index) => (
          <Tooltip title={val.tooltip} placement="top" key={index}>
            <Chip label={`${val.name} ${val.data}`} variant="outlined" color={val.bColor} sx={{ margin: "3px" }} />
          </Tooltip>
        ))}
        {node.redfish.storage.drives.map((val, index) => {
          let icon = <></>
          if (val.type === "SSD")
            icon = <i className="bi bi-device-ssd" style={{ marginLeft: "8px", marginBottom: "0", fontSize: "15pt" }} />
          if (val.type === "HDD")
            icon = <i className="bi-device-hdd" style={{ marginLeft: "8px", marginBottom: "0", fontSize: "15pt" }} />

          let titleArr = [
            { name: "Name:", data: val.name },
            { name: "Slot", data: val.slot },
            { name: "Manufacturer:", data: val.manufacturer },
            { name: "Protocol", data: `${val.capable_speed} Gbps ${val.protocol}` },
            val.rotation_speed !== null ? { name: "Rotation Speed:", data: `${val.rotation_speed} RPM` } : {},
            val.predicted_write_endurance !== null
              ? { name: "Write Endurance:", data: `${val.predicted_write_endurance}%` }
              : {},
            val.hotspare_type !== "None" ? { name: "Hotspare Type:", data: val.hotspare_type } : {},
          ]

          return (
            <DataDisplay
              titleArr={titleArr}
              icon={icon}
              color={statusColor(val.status)}
              label={`${val.capacity}`}
              key={index}
            />
          )
        })}
        {node.redfish.storage.volumes.map((val, index) => {
          if (val.volume_type !== "RawDevice" && val.raid_type !== "") {
            let icon = <StorageIcon fontSize="small" />

            let titleArr = [
              { name: "Name:", data: val.name },
              { name: "Description:", data: val.description },
              { name: "Volume Type:", data: val.volume_type },
              { name: "RAID Type:", data: val.raid_type },
            ]

            return (
              <DataDisplay
                titleArr={titleArr}
                icon={icon}
                color={statusColor(val.status)}
                label={`${val.capacity} ${val.raid_type}`}
                key={index}
              />
            )
          }
        })}
        {node.redfish.network.map((val, index) => {
          let color = "border.main"
          let bColor = "default"
          let speed = val.speed ?? "0"

          if (val.speed === 100000) {
            bColor = "info"
            speed = "100GbE"
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
          else if (val.type === "Down") color = "border.main"

          return (
            <DataDisplay
              type="avatar"
              titleArr={titleArr}
              icon={val.id.match(/([0-9]-[0-9])|[0-9]/g)}
              color={bColor}
              backgroundColor={color}
            />
          )
        })}
        {node.redfish.pcie.map((val, index) => {
          let icon = <i className="bi bi-pci-card" style={{ marginLeft: "8px", marginBottom: "0", fontSize: "15pt" }} />
          let titleArr = [
            { name: "Status:", data: val.status },
            { name: "Manufacturer:", data: val.manufacturer },
            { name: "Name:", data: val.name },
          ]
          return (
            <DataDisplay titleArr={titleArr} icon={icon} color={statusColor(val.status)} label="PCI Card" key={index} />
          )
        })}
        {node.redfish.processor.map((val, index) => {
          let icon = <i className="bi bi-cpu" style={{ marginLeft: "8px", marginBottom: "0", fontSize: "15pt" }} />
          let titleArr = [
            { name: "Model:", data: val.model },
            { name: "Hyper-Threading:", data: val.logical_proc },
            { name: "Cores:", data: val.cores },
            { name: "Threads:", data: val.threads },
            { name: "Turbo:", data: val.turbo },
            { name: "Frequency:", data: val.frequency },
            { name: "Max Frequency:", data: val.max_frequency },
          ]
          return (
            <DataDisplay
              titleArr={titleArr}
              icon={icon}
              color={statusColor(val.status)}
              label="Processor"
              key={index}
            />
          )
        })}
        {node.redfish.gpu.gpus.map((val, index) => {
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography fontSize={12} sx={{ border: 1, borderColor: "border.secondary", borderRadius: 1 }}>
                {val.model}
              </Typography>
            </Grid>
          )
        })}
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
