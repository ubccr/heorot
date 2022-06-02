import { useState } from "react"
import {
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material"

const EditNodes = () => {
  const [action, setAction] = useState("")
  const handleChange = (e) => {
    setAction(e.target.value)
  }
  const [actionValue, setActionValue] = useState("")
  const handleValueChange = (e) => {
    setActionValue(e.target.value)
  }
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "16pt" }}>
        Edit Nodes:
      </Typography>
      <form>
        <Grid
          container
          spacing={2}
          sx={{
            overflow: "hidden",
            padding: "10px",
            alignItems: "center",
            justifyContent: "center",
            height: "auto",
            minHeight: 60,
          }}
        >
          <Grid item xs>
            <TextField
              label="Nodeset"
              placeholder="ex: cpn-z01-[03-32]"
              sx={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs>
            <FormControl fullWidth>
              <InputLabel id="select-label">Action</InputLabel>
              <Select
                labelId="select-label"
                value={action}
                label="Action"
                onChange={handleChange}
              >
                <MenuItem value={"provision"}>Set Provision</MenuItem>
                <MenuItem value={"tags"}>Set Tags</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs>
            {action == "provision" && (
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="value-select-label">Value</InputLabel>
                <Select
                  labelId="value-select-label"
                  value={actionValue}
                  label="Value"
                  onChange={handleValueChange}
                >
                  <MenuItem value={"true"}>True</MenuItem>
                  <MenuItem value={"false"}>False</MenuItem>
                </Select>
              </FormControl>
            )}
            {action !== "provision" && (
              <TextField
                label="Value"
                placeholder="z01,ubhpc,gpu"
                sx={{ width: "100%" }}
              ></TextField>
            )}
          </Grid>
          <Grid item xs>
            <Button variant="outlined">Submit</Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default EditNodes
