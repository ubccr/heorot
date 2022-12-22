import { Checkbox, Divider, FormControlLabel, Grid, TextField, Typography } from "@mui/material"

import React from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"

const Interfaces = ({ apiData, setApiData }) => {
  const [gridRef] = useAutoAnimate(null)

  return (
    <Grid container>
      {apiData.interfaces.map((val, index) => {
        let last = false
        if (apiData.interfaces.length === index + 1) last = true
        let interfaceData = [
          { id: "ifname", name: "Name:", data: val.ifname },
          { id: "fqdn", name: "FQDN:", data: val.fqdn },
          { id: "ip", name: "IP:", data: val.ip },
          { id: "mac", name: "MAC:", data: val.mac },
          { id: "vlan", name: "VLAN:", data: val.vlan },
          { id: "mtu", name: "MTU:", data: val.mtu },
          { id: "bmc", name: "BMC", data: val.bmc },
        ]
        return (
          <React.Fragment key={index}>
            <Grid sm={12} md item>
              <Grid
                container
                sx={{
                  padding: "20px",
                  borderRadius: "10px",
                  marginTop: "12px",
                  border: 1,
                  borderColor: "border.main",
                  bgcolor: "background.main",
                  color: "text.primary",
                  boxShadow: 12,
                }}
              >
                {interfaceData.map((val, index2) => (
                  <React.Fragment key={index2}>
                    <Grid xs={12} item sx={{ margin: "5px" }}>
                      {typeof val.data !== "boolean" && (
                        <TextField
                          variant="outlined"
                          label={val.name}
                          value={val.data}
                          onChange={(e) => {
                            apiData.interfaces[index][val.id] = e.target.value
                            setApiData({ ...apiData })
                          }}
                          fullWidth
                          size="small"
                        />
                      )}
                      {typeof val.data === "boolean" && (
                        <FormControlLabel
                          label={val.name}
                          control={
                            <Checkbox
                              checked={val.data}
                              onChange={(e) => {
                                apiData.interfaces[index][val.id] = e.target.checked
                                setApiData({ ...apiData })
                              }}
                              size="small"
                            />
                          }
                        />
                      )}
                    </Grid>
                  </React.Fragment>
                ))}
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
