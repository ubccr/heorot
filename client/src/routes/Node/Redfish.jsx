import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useState } from "react"

import { Box } from "@mui/system"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const Redfish = ({ query }) => {
  let data = query.data.redfish
  if (data === undefined) return <Typography>No Redfish data found!</Typography>
  return (
    <TableContainer>
      <Table>
        <TableHead></TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Model:</TableCell>
            <TableCell align="right">{data.model}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Manufacturer:</TableCell>
            <TableCell align="right">{data.manufacturer}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Service Tag:</TableCell>
            <TableCell align="right">{data.service_tag}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BIOS Version:</TableCell>
            <TableCell align="right">{data.bios_version}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Boot Order:</TableCell>
            <TableCell align="right">{data.boot_order}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Hostname:</TableCell>
            <TableCell align="right">{data.hostname}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BMC address:</TableCell>
            <TableCell align="right">
              <CollapseTable display={data.bmc.addresses.ip}>
                <TableRow>
                  <TableCell>Address:</TableCell>
                  <TableCell>{data.bmc.addresses.ip}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Type:</TableCell>
                  <TableCell>{data.bmc.addresses.type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gateway:</TableCell>
                  <TableCell>{data.bmc.addresses.gateway}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Subnet Mask:</TableCell>
                  <TableCell>{data.bmc.addresses.subnet_mask}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>VLAN:</TableCell>
                  <TableCell>{data.bmc.vlan}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DNS:</TableCell>
                  <TableCell>{data.bmc.dns.join(", ")}</TableCell>
                </TableRow>
              </CollapseTable>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BMC version:</TableCell>
            <TableCell align="right">{data.bmc.version}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Memory:</TableCell>
            <TableCell align="right">
              {data.memory.size}, {data.memory.speed}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>GPU Count:</TableCell>
            <TableCell align="right">
              <CollapseTable display={data.gpu.physical}>
                <TableRow>
                  <TableCell>Physical:</TableCell>
                  <TableCell>{data.gpu.physical}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Virtual:</TableCell>
                  <TableCell>{data.gpu.virtual}</TableCell>
                </TableRow>
                {data.gpu.gpus.map((val, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>Manufacturer:</TableCell>
                      <TableCell>{val.manufacturer}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Model:</TableCell>
                      <TableCell>{val.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </CollapseTable>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Volume Count:</TableCell>
            <TableCell align="right">
              <CollapseTable display={data.storage.volumes.length}>
                {data.storage.volumes.map((val, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>Name:</TableCell>
                      <TableCell>{val.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Description:</TableCell>
                      <TableCell>{val.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Volume Type:</TableCell>
                      <TableCell>{val.volume_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>RAID Type:</TableCell>
                      <TableCell>{val.raid_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Capacity:</TableCell>
                      <TableCell>{val.capacity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </CollapseTable>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Drive Count:</TableCell>
            <TableCell align="right">
              <CollapseTable display={data.storage.drives.length}>
                {data.storage.drives.map((val, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>Slot:</TableCell>
                      <TableCell>{val.slot}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Capacity:</TableCell>
                      <TableCell>{val.capacity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type:</TableCell>
                      <TableCell>{val.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Model:</TableCell>
                      <TableCell>{val.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Description:</TableCell>
                      <TableCell>{val.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Manufacturer:</TableCell>
                      <TableCell>{val.manufacturer}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Serial Number:</TableCell>
                      <TableCell>{val.serial_number}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Protocol:</TableCell>
                      <TableCell>{val.protocol}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Capable Speed:</TableCell>
                      <TableCell>{val.capable_speed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rotation Speed:</TableCell>
                      <TableCell>{val.rotation_speed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Predicted Write Endurance:</TableCell>
                      <TableCell>{val.predicted_write_endurance}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Hotspare Type:</TableCell>
                      <TableCell>{val.hotspare_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </CollapseTable>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SEL Count:</TableCell>
            <TableCell align="right">
              <CollapseTable display={data.sel.logs.length}>
                {data.sel.logs.map((val, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>Severity:</TableCell>
                      <TableCell>{val.severity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Timestamp:</TableCell>
                      <TableCell>{val.created}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Message:</TableCell>
                      <TableCell>{val.message}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </CollapseTable>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const CollapseTable = (props) => {
  const [expand, setExpand] = useState(false)
  return (
    <>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        {expand === false && <Typography>{props.display}</Typography>}
        <IconButton size="small" onClick={() => setExpand(!expand)}>
          {expand === false && <ExpandMoreIcon />}
          {expand === true && <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={expand}>
        <Table size="small">
          <TableBody>{props.children}</TableBody>
        </Table>
      </Collapse>
    </>
  )
}

export default Redfish
