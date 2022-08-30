import { Box, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, TextField } from "@mui/material"
import { useContext, useState } from "react"

import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"

const ConfigureInterfaces = () => {
  const [render, setRender] = useState([])
  let iface = { FQDN: "", IpAddress: "", MacAddress: "", bmc: false }

  console.log(render)
  return (
    <>
      <IconButton
        color="primary"
        onClick={() => {
          setRender([...render, iface])
        }}
      >
        <AddIcon />
      </IconButton>
      <Box sx={{ margin: "20px" }}>
        <Grid container spacing={2}>
          {render.length > 0 &&
            render.map((val, index) => (
              <Grid item xs={6} key={index}>
                <FormGroup>
                  <FormControlLabel control={<Checkbox />} label="BMC" value={val.bmc} />
                  <IconButton
                    color="primary"
                    onClick={() => {
                      console.log(index)
                      setRender([...render.filter((val, index2) => index2 !== index)])
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <div>{index}</div>
                  <TextField label="FQDN" variant="outlined" onChange={(e) => (val.FQDN = e.target.value)}>
                    {val.FQDN}
                  </TextField>
                  <TextField label="IP Address" variant="outlined" onChange={(e) => (val.IpAddress = e.target.value)}>
                    {val.IpAddress}
                  </TextField>
                  <TextField label="MAC Address" variant="outlined" onChange={(e) => (val.MacAddress = e.target.value)}>
                    {val.MacAddress}
                  </TextField>
                </FormGroup>
              </Grid>
            ))}
        </Grid>
      </Box>
    </>
  )
}

export default ConfigureInterfaces
