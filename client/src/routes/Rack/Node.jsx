import { Badge, Box, Divider, Grid, Typography } from "@mui/material"

import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew"
import React from "react"
import Storage from "./Storage"

const Node = ({ grendel, redfish }) => {
  let powerColor = redfish.power_state === "On" ? "success" : "error"
  if (redfish.status === "error") return <div>{grendel[0].name}</div>

  let address_source_color = "border.main"
  if (redfish.bmc.addresses.type === "Static") address_source_color = "border.table.four"

  let node_info = [
    { name: "", data: redfish.model, bColor: "border.main" },
    { name: "", data: redfish.service_tag, bColor: "border.main" },
    { name: "BIOS Version:", data: redfish.bios_version, bColor: "border.main" },
    // { name: "Hostname", data: redfish.hostname, bColor: "border.main" },
    { name: "BMC Address:", data: redfish.bmc.addresses.ip, bColor: address_source_color },
    // { name: "Address Source", data: redfish.bmc.addresses.type, bColor: address_source_color },
    { name: "BMC Version:", data: redfish.bmc.version, bColor: "border.main" },
    { name: "BMC DNS:", data: redfish.bmc.dns.join(","), bColor: "border.main" },
  ]
  if (redfish.bmc.vlan != 1) node_info.push({ name: "BMC vlan", data: redfish.bmc.vlan, bColor: "border.main" })
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {grendel[0].name}
          <PowerSettingsNewIcon color={powerColor} sx={{ float: "right" }} />
        </Grid>

        {node_info.map((val, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Typography fontSize={12} sx={{ border: 1, borderColor: val.bColor, borderRadius: 1 }} key={index}>
              {val.name} {val.data}
            </Typography>
          </Grid>
        ))}
        {redfish.storage.drives.map((val, index) => (
          <Grid item xs={6} sm={3} md={2} key={index}>
            <Typography
              fontSize={12}
              sx={{ border: 1, borderColor: "border.table.double", borderRadius: 1 }}
              key={index}
            >
              {val.capacity} {val.type}
            </Typography>
          </Grid>
        ))}
        {redfish.storage.volumes.map((val, index) => {
          if (val.volume_type !== "RawDevice" && val.raid_type !== "")
            return (
              <Grid item xs={6} sm={3} md={2} key={index}>
                <Typography
                  fontSize={12}
                  sx={{ border: 1, borderColor: "border.table.quad", borderRadius: 1 }}
                  key={index}
                >
                  {val.capacity} {val.raid_type}
                </Typography>
              </Grid>
            )
        })}
        {redfish.network.map((val, index) => {
          let color = "border.main"
          let bColor = "default"

          if (val.link === "Up") color = "border.table.double"
          else if (val.type === "Down") color = "border.main"

          if (val.speed === 100000) bColor = "info"
          else if (val.speed === 40000) bColor = "error"
          else if (val.speed === 10000) bColor = "primary"
          else if (val.speed === 1000) bColor = "success"
          else if (val.speed === 100) bColor = "warning"

          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Badge sx={{ float: "right" }} color={bColor} variant="dot" />
              <Typography fontSize={12} sx={{ border: 1, borderColor: color, borderRadius: 1 }}>
                {val.id.replace(/\./g, " ")}
              </Typography>
            </Grid>
          )
        })}
        {redfish.pcie.map((val, index) => {
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography
                fontSize={12}
                sx={{ border: 1, borderColor: "border.secondary", borderRadius: 1 }}
                key={index}
              >
                {val.name}
              </Typography>
            </Grid>
          )
        })}
        {redfish.processor.map((val, index) => {
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography
                fontSize={12}
                sx={{ border: 1, borderColor: "border.secondary", borderRadius: 1 }}
                key={index}
              >
                {val.model}
              </Typography>
            </Grid>
          )
        })}
        {redfish.gpu.gpus.map((val, index) => {
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography
                fontSize={12}
                sx={{ border: 1, borderColor: "border.secondary", borderRadius: 1 }}
                key={index}
              >
                {val.model}
              </Typography>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}

export default Node
