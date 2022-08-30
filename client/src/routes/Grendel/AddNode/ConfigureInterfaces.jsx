import { Box, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, TextField } from "@mui/material"

import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"

const ConfigureInterfaces = ({ ifaces, setIfaces }) => {
  return (
    <>
      <Box>
        {/* <IconButton
          color="primary"
          onClick={() => {
            setIfaces([...ifaces, iface])
          }}
        >
          <AddIcon />
        </IconButton> */}

        <Grid container spacing={2}>
          {ifaces.map((val, index) => (
            <Grid item xs={6} key={index}>
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
                </FormGroup>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}

export default ConfigureInterfaces
