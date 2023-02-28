import { Box, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, TextField } from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"
import { useAutoAnimate } from "@formkit/auto-animate/react"

const ConfigureInterfaces = ({ ifaces, setIfaces }) => {
  const [ifaceRef] = useAutoAnimate()
  return (
    <Box>
      <Grid container spacing={2} ref={ifaceRef}>
        {ifaces.map((val, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Box sx={{ border: 1, padding: "10px", borderColor: "border.main", borderRadius: "10px" }}>
              <FormGroup>
                <Box sx={{ display: "flex" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(e) => {
                          ifaces[index].bmc = e.target.checked
                          setIfaces([...ifaces])
                        }}
                        checked={val.bmc}
                      />
                    }
                    label="BMC"
                  />
                  <Box sx={{ flex: "1 1 auto" }}></Box>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setIfaces([...ifaces.filter((v, i) => index !== i)])
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <TextField
                  size="small"
                  label="FQDN"
                  variant="outlined"
                  onChange={(e) => {
                    ifaces[index].fqdn = e.target.value
                    setIfaces([...ifaces])
                  }}
                  sx={{ marginBottom: "8px" }}
                  autoComplete="new-password"
                  value={val.fqdn}
                />
                <TextField
                  size="small"
                  label="IP Address"
                  variant="outlined"
                  onChange={(e) => {
                    ifaces[index].ip = e.target.value
                    setIfaces([...ifaces])
                  }}
                  sx={{ marginBottom: "8px" }}
                  autoComplete="new-password"
                  value={val.ip}
                />
                <TextField
                  size="small"
                  label="MAC Address"
                  variant="outlined"
                  onChange={(e) => {
                    ifaces[index].mac = e.target.value
                    setIfaces([...ifaces])
                  }}
                  sx={{ marginBottom: "8px" }}
                  autoComplete="new-password"
                  value={val.mac}
                />
                <TextField
                  size="small"
                  label="VLAN"
                  variant="outlined"
                  onChange={(e) => {
                    ifaces[index].vlan = e.target.value
                    setIfaces([...ifaces])
                  }}
                  sx={{ marginBottom: "8px" }}
                  autoComplete="new-password"
                  value={val.vlan}
                />
                <TextField
                  size="small"
                  label="MTU"
                  variant="outlined"
                  type="number"
                  onChange={(e) => {
                    ifaces[index].mtu = parseInt(e.target.value)
                    setIfaces([...ifaces])
                  }}
                  sx={{ marginBottom: "8px" }}
                  autoComplete="new-password"
                  value={val.mtu}
                />
              </FormGroup>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ConfigureInterfaces
