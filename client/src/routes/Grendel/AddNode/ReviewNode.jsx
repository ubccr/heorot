import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

import React from "react"

const ReviewNode = ({ options, ifaces }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Node Options:
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Node Name:</TableCell>
                <TableCell align="right">{options.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Firmware:</TableCell>
                <TableCell align="right">{options.firmware}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Boot Image:</TableCell>
                <TableCell align="right">{options.boot_image}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Provision:</TableCell>
                <TableCell align="right">{options.provision.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tags:</TableCell>
                <TableCell align="right">{options.tags.join(",")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Interfaces:
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ifaces.map((val, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>BMC:</TableCell>
                    <TableCell align="right">{val.bmc.toString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FQDN:</TableCell>
                    <TableCell align="right">{val.fqdn}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IP Address:</TableCell>
                    <TableCell align="right">{val.ip}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FQDN:</TableCell>
                    <TableCell align="right">{val.mac}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export default ReviewNode
