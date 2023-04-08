import { Divider, Grid, Typography } from "@mui/material"

import React from "react"

const TooltipGen = ({ port, query, nodeQuery = null }) => {
  if (query.isFetched && query.data?.success === true) {
    let portInfo = query.data.mac_address_table.filter((val) => val.port === port.port)
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
          {port.description !== "" && (
            <Grid item xs={12}>
              Description: {port.description}
              <Divider sx={{ borderColor: "border.main" }} />
            </Grid>
          )}
          <>
            {port.status !== "" && (
              <>
                <Grid item xs={6}>
                  Status:
                </Grid>
                <Grid item xs={6}>
                  {port.status}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: "border.main" }} />
                </Grid>
              </>
            )}
            {port.speed !== "" && port.speed !== "0" && (
              <>
                <Grid item xs={6}>
                  Speed:
                </Grid>
                <Grid item xs={6}>
                  {port.speed}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: "border.main" }} />
                </Grid>
              </>
            )}
            {port.vlan !== "" && (
              <>
                <Grid item xs={6}>
                  Vlans:
                </Grid>
                <Grid item xs={6}>
                  {port.vlan}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: "border.main" }} />
                </Grid>
              </>
            )}
            {portMacs.length > 0 && (
              <>
                <Grid item xs={6}>
                  MACs:
                </Grid>
                <Grid item xs={6}>
                  {portMacs.join(", ")}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: "border.main" }} />
                </Grid>
              </>
            )}
          </>
        </Grid>
      </>
    )
  }
  return <>{query.isFetched && query.data.success === true && query.data.client}</>
}

export default TooltipGen
