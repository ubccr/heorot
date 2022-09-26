import { Divider, Grid, TextField, Typography } from "@mui/material"

import React from "react"

const Interfaces = ({ data }) => {
  return (
    <Grid container>
      {data.map((val, index) => {
        let name = "Interface:"
        let last = false
        if (data.length === index + 1) last = true
        if (val.fqdn.substring(0, 3) === "bmc") name = "BMC:"
        return (
          <React.Fragment key={val.fqdn}>
            <Grid sm={12} md item>
              <Grid
                container
                sx={{
                  padding: "20px",
                  paddingTop: "5px",
                  borderRadius: "10px",
                  marginTop: "12px",
                  border: 1,
                  borderRadius: "10px",
                  borderColor: "border.main",
                  bgcolor: "background.main",
                  color: "text.primary",
                  boxShadow: 12,
                }}
              >
                <Grid xs={12} item>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: "24px",
                      textAlign: "center",
                      marginBottom: "12px",
                      fontWeight: "400",
                    }}
                  >
                    {name}
                  </Typography>
                </Grid>
                <Grid xs={2} item>
                  FQDN:
                </Grid>
                <Grid xs={10} item sx={{ textAlign: "end" }}>
                  {name !== "BMC:" && val.fqdn}
                  {name === "BMC:" && (
                    <a target="_blank" href={`https://${val.fqdn}`}>
                      {val.fqdn}
                    </a>
                  )}
                </Grid>
                <Divider sx={{ width: "100%", marginTop: "6px", marginBottom: "6px" }} />
                <Grid xs={6} item>
                  IP:
                </Grid>
                <Grid xs={6} item sx={{ textAlign: "end" }}>
                  {val.ip}
                </Grid>
                <Divider sx={{ width: "100%", marginTop: "6px", marginBottom: "6px" }} />
                <Grid xs={6} item>
                  MAC:
                </Grid>
                <Grid xs={6} item sx={{ textAlign: "end" }}>
                  {val.mac}
                </Grid>
              </Grid>
            </Grid>
            {!last && <Divider orientation="vertical" sx={{ margin: "6px" }} />}
          </React.Fragment>
        )
      })}
    </Grid>
  )
}

export default Interfaces
