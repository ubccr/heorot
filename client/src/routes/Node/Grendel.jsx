import {
  Box,
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
import React, { useEffect } from "react"

import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useState } from "react"

const Grendel = ({ query }) => {
  const [data, setData] = useState([])
  useEffect(() => {
    let interfaceData = query.data.result.interfaces.map((val) => {
      return [
        { name: "Name:", data: val.name },
        { name: "FQDN:", data: val.fqdn },
        { name: "IP:", data: val.ip },
        { name: "MAC:", data: val.mac },
        { name: "VLAN:", data: val.vlan },
        { name: "MTU:", data: val.mtu },
        { name: "BMC:", data: val.bmc === true ? "true" : "false" },
      ]
    })
    setData([
      { name: "Provision:", data: query.data.result.provision === true ? "true" : "false" },
      { name: "Tags:", data: query.data.result.tags.join(", ") },

      ...interfaceData.map((val, index) => {
        return { name: `Interface ${index + 1}`, data: <Interfaces data={val} key={index} /> }
      }),
      ,
      { name: "Boot Image:", data: query.data.result.boot_image },
      { name: "Firmware:", data: query.data.result.firmware },
      { name: "ID:", data: query.data.result.id },
    ])

    return () => {
      setData([])
    }
  }, [query])

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Field:</TableCell>
            <TableCell align="right">Value:</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((val, index) => (
            <TableRow key={index}>
              <TableCell>{val.name}</TableCell>
              <TableCell align="right">{val.data}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const Interfaces = ({ data }) => {
  const [expand, setExpand] = useState(false)

  let fqdn = data.find((val) => val.name === "FQDN:").data
  let ip = data.find((val) => val.name === "IP:").data

  let shortDisplay = fqdn !== "" ? fqdn : ip
  return (
    <>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        {expand === false && <Typography>{shortDisplay}</Typography>}
        <IconButton size="small" onClick={() => setExpand(!expand)}>
          {expand === false && <ExpandMoreIcon />}
          {expand === true && <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={expand}>
        <Table size="small">
          <TableBody>
            {data.map((val, index) => (
              <TableRow key={index}>
                <TableCell>{val.name}</TableCell>
                <TableCell>{val.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Collapse>
    </>
  )
}

export default Grendel
