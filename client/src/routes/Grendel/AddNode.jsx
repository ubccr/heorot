import {
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material"
import { useContext, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const AddNode = () => {
  const [image, setImage] = useState("")
  const [firmware, setFirmware] = useState("")
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const imageQuery = useQuery(
    "image",
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/image/list`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )
  const firmwareQuery = useQuery(
    "firmware",
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/firmware/list`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )

  return (
    <FormGroup>
      <Grid container spacing={2}>
        <Grid item xs={6} md={2}>
          <TextField label="Node" placeholder="cpn-a01-01" variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>
              Firmware {firmwareQuery.isLoading && <CircularProgress color="primary" size={15} />}
            </InputLabel>
            <Select
              value={firmware}
              onOpen={() => firmwareQuery.refetch()}
              label={"Firmware"}
              onChange={(e) => setFirmware(e.target.value)}
              variant="outlined"
            >
              {firmwareQuery.isFetched &&
                firmwareQuery.data.status === "success" &&
                firmwareQuery.data.result.map((val, index) => {
                  return (
                    <MenuItem value={val} key={index}>
                      {val}
                    </MenuItem>
                  )
                })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Boot Image {imageQuery.isLoading && <CircularProgress color="primary" size={15} />}</InputLabel>
            <Select
              value={image}
              onOpen={() => imageQuery.refetch()}
              label={"Boot Image"}
              onChange={(e) => setImage(e.target.value)}
              variant="outlined"
            >
              {imageQuery.isFetched &&
                imageQuery.data.status === "success" &&
                imageQuery.data.result.map((val, index) => {
                  return (
                    <MenuItem value={val.name} key={index}>
                      {val.name}
                    </MenuItem>
                  )
                })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          {/* add or remove  */}
          <TextField label="Interfaces" variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={6}>
          <FormGroup>
            <FormControlLabel control={<Switch defaultChecked />} label="Provision" />
          </FormGroup>
        </Grid>
        <Grid item xs={6}>
          <TextField label="Tags" variant="outlined" fullWidth />
        </Grid>
      </Grid>
    </FormGroup>
  )
}

export default AddNode
