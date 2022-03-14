import {
  Hidden,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import React from "react"
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined"

const SELTable = ({ data }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <Hidden mdDown>
              <TableCell>Date:</TableCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Time:</TableCell>
            </Hidden>
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
            }
            return (
              <TableRow key={val.id}>
                <TableCell>{icon}</TableCell>
                <Hidden mdDown>
                  <TableCell>{val.date}</TableCell>
                </Hidden>
                <Hidden mdDown>
                  <TableCell>{val.time}</TableCell>
                </Hidden>
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
