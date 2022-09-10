import { Divider, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material"

import React from "react"

const TooltipGen = ({ port, query, nodeQuery = null }) => {
  if (query.isFetched && query.data.status === "success") {
    let portInfo = query.data.data.filter((val) => val.interface === port.port)
    let portMacs = portInfo.map((val) => {
      return val.mac
    })
    let nodeMapping = new Array()

    if (nodeQuery !== null && nodeQuery.isFetched && nodeQuery.data.status === "success") {
      //   nodeMapping = nodeQuery.data.result
      //     .map((val, index) => {
      //       let tmp = val.interfaces.map((e) => portMacs.includes(e.mac))
      //       if (tmp !== undefined) return val
      //     })
      //     .filter(Boolean)

      nodeMapping = portMacs
        .map((key) => nodeQuery.data.result.find((val) => val.interfaces.find((iface) => iface.mac === key)))
        .filter(Boolean)
    }

    query.data.client = (
      <>
        <Grid container>
          {nodeMapping.length !== 0 &&
            nodeMapping.map((val, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12}>
                  <Typography align="center">{val.name}</Typography>
                </Grid>
                {val.interfaces.map((ifaces, index) => (
                  <React.Fragment key={index}>
                    {/* <Typography>FQDN: {ifaces.fqdn}</Typography> */}
                    <Grid item xs={6}>
                      <Typography align="center">{ifaces.ip}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="center">{ifaces.mac}</Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          {port.description !== "" && (
            <Grid item xs={12}>
              <Typography>Description: {port.description}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Divider sx={{ borderColor: "border.main" }} />
          </Grid>
          <Grid item xs={6}>
            <Typography>Speed: {port.speed}</Typography>
          </Grid>
          <Grid item xs={6}>
            {port.vlans !== "" && <Typography>vlans: {port.vlans}</Typography>}
          </Grid>
          {portMacs.map((mac, index) => (
            <Grid item xs={6} key={index}>
              <Typography>{mac}</Typography>
            </Grid>
          ))}

          {/* <Typography>Dulplex: {port.duplex}</Typography> */}
          {/* <Typography>Mode: {port.mode}</Typography> */}
          {/* {portInfo.map((val, index) => (
            <React.Fragment key={index}>
            <Typography>MAC: {val.mac}</Typography>
            <Typography>vlan: {val.vlan}</Typography>
            </React.Fragment>
        ))} */}
        </Grid>
      </>
    )
  }
  return <>{query.isFetched && query.data.status === "success" && query.data.client}</>
}

export default TooltipGen
