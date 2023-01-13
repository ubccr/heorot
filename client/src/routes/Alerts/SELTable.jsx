import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"
import React from "react"
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"

const SELTable = ({ data }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Date and Time:</TableCell>
            <TableCell>Event:</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((val, index) => {
            let icon = ""
            switch (val.severity) {
              case "OK":
                icon = <CheckBoxOutlinedIcon color="success" />
                break
              case "Warning":
                icon = <WarningAmberOutlinedIcon sx={{ color: "#ff9800" }} />
                break
              case "Critical":
                icon = <ReportOutlinedIcon sx={{ color: "#c62828" }} />
                break
              default:
                icon = ""
                break
            }
            return (
              <TableRow key={index}>
                <TableCell>{icon}</TableCell>
                <TableCell>{new Date(val.created).toLocaleString()}</TableCell>
                <TableCell>{val.message}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SELTable
