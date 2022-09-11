import { Box, Divider, Grid, Typography } from "@mui/material"

import React from "react"

const TooltipGen = ({ port, query, nodeQuery = null }) => {
  if (query.isFetched && query.data.status === "success") {
    let portInfo = query.data.data.filter((val) => val.interface === port.port)
    let portMacs = portInfo.map((val) => {
      return val.mac
    })
    let nodeMapping = []
    if (nodeQuery !== null && nodeQuery.isFetched && nodeQuery.data.status === "success") {
      // function for finding grendel interfaces that match the MAC addresses
      portMacs.forEach((key) => {
        nodeQuery.data.result.forEach((val) => {
          val.interfaces.forEach((e) => {
            if (e.mac === key) {
              nodeMapping.push({
                name: val.name,
                ...e,
              })
            }
          })
        })
      })
    }

    query.data.client = (
      <>
        <Grid container>
          {nodeMapping.length !== 0 &&
            nodeMapping.map((val, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12}>
                  <Typography align="center" variant="body2">
                    {val.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="center" variant="body2">
                    {val.ip}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="center" variant="body2">
                    {val.mac}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: "border.main" }} />
                </Grid>
              </React.Fragment>
            ))}
        </Grid>
        {port.description !== "" && (
          <>
            <Typography variant="body2">Description: {port.description}</Typography>
            <Divider sx={{ borderColor: "border.main" }} />
          </>
        )}
        {nodeMapping.length === 0 && (
          <>
            {port.status !== "" && <> Status: {port.status}, </>}
            {port.speed !== "" && port.speed !== "0" && <> Speed: {port.speed}, </>}
            {port.vlans !== "" && <> Vlans: {port.vlans}, </>}
            {portMacs.length > 0 && portMacs.join(", ")}
          </>
        )}
      </>
    )
  }
  return <>{query.isFetched && query.data.status === "success" && query.data.client}</>
}

export default TooltipGen
