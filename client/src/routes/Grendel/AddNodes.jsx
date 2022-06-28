import {
  Button,
  FormGroup,
  Grid,
  TextareaAutosize,
  TextField,
  Typography,
  Box,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogActions,
  IconButton,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useState, useContext } from "react"
import { useSnackbar } from "notistack"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
const AddNodes = () => {
  const [user, setUser] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()
  const [open, setOpen] = useState(false)
  const [nodeJson, setNodeJson] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()

    let form = event.target
    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sw: form.switch.value,
        domain: form.domain.value,
        subnet: form.subnet.value,
        bmcSubnet: form.bmcSubnet.value,
        mapping: form.mapping.value,
      }),
    }
    fetch(`${apiConfig.apiUrl}/grendel/discover`, payload)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          enqueueSnackbar(`Successfully discovered hosts`, {
            variant: "success",
          })
          setOpen(true)
          setNodeJson(JSON.stringify(result.node, null, 4))
        } else if (result.status === "error")
          enqueueSnackbar(`${result.error}`, {
            variant: "error",
          })
      })
  }
  const handleTab = (e) => {
    if (e.keyCode === 9 && !e.shiftKey) {
      e.preventDefault()
      let val = e.target.value,
        start = e.target.selectionStart,
        end = e.target.selectionEnd

      e.target.value = val.substring(0, start) + "\t" + val.substring(end)
      e.target.selectionStart = e.target.selectionEnd = start + 1
    }
  }
  const handleJson = () => {
    try {
      let a = JSON.parse(nodeJson) // just to generate an error
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: nodeJson,
      }
      fetch(`${apiConfig.apiUrl}/grendel/host`, payload)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success") {
            enqueueSnackbar(
              `Successfully added ${result.result.hosts} host(s)`,
              {
                variant: "success",
              }
            )
          } else if (result.status === "error")
            enqueueSnackbar(
              `Failed to edit node. Response: ${result.result.message}`,
              {
                variant: "error",
              }
            )
        })
    } catch (e) {
      enqueueSnackbar(`Error in JSON syntax: ${e}`, { variant: "error" })
    }
  }
  return (
    <>
      <Typography
        variant="h2"
        sx={{ fontSize: "16pt", marginTop: "20px", marginBottom: "10px" }}
      >
        Add Nodes:
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs>
              <TextField
                fullWidth
                label="Switch"
                name="switch"
                placeholder="swe-z01-22"
                required
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label="Domain"
                defaultValue={apiConfig.grendelDomain}
                name="domain"
                required
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label="Subnet"
                name="subnet"
                defaultValue={apiConfig.grendelSubnet}
                required
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label="BMC Subnet"
                defaultValue={apiConfig.grendelBmcSubnet}
                name="bmcSubnet"
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "inline-flex" }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: "12pt",
                marginTop: "20px",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            >
              Host Mapping:
            </Typography>
            <Button
              variant="outlined"
              size="small"
              type="submit"
              sx={{ marginTop: "15px" }}
            >
              Submit
            </Button>
          </Box>
          <TextField
            multiline
            name="mapping"
            placeholder="tab delimited"
            required
            onKeyDown={(e) => handleTab(e)}
            sx={{ margin: "10px" }}
          ></TextField>
        </FormGroup>
      </form>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Discovered Nodes:
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <TextField
          multiline
          value={nodeJson}
          onChange={(e) => {
            setNodeJson(e.target.value)
          }}
          sx={{ margin: "10px" }}
        />

        <DialogActions>
          <Button variant="outlined" onClick={handleJson}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddNodes
