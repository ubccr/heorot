import { CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const NodeOptions = ({ options, setOptions }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const imageQuery = useQuery("image", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/grendel/image/list`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
    return res
  })
  const firmwareQuery = useQuery("firmware", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/grendel/firmware/list`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
    return res
  })

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} md={4}>
        <TextField
          label="Node Name"
          placeholder="cpn-a01-01"
          variant="outlined"
          value={options.name}
          onChange={(e) => setOptions({ ...options, name: e.target.value })}
          fullWidth
          autoComplete="new-password"
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Firmware {firmwareQuery.isLoading && <CircularProgress color="primary" size={15} />}</InputLabel>
          <Select
            value={options.firmware}
            onOpen={() => firmwareQuery.refetch()}
            label={"Firmware"}
            onChange={(e) => setOptions({ ...options, firmware: e.target.value })}
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
      <Grid item xs={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Boot Image {imageQuery.isLoading && <CircularProgress color="primary" size={15} />}</InputLabel>
          <Select
            value={options.boot_image}
            onOpen={() => imageQuery.refetch()}
            label={"Boot Image"}
            onChange={(e) => setOptions({ ...options, boot_image: e.target.value })}
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

      <Grid item xs={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Provision</InputLabel>
          <Select
            value={options.provision}
            label={"Provision"}
            onChange={(e) => setOptions({ ...options, provision: e.target.value })}
            variant="outlined"
          >
            <MenuItem value={true}>true</MenuItem>
            <MenuItem value={false}>false</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} md={4}>
        <TextField
          value={options.tags.join(",")}
          label="Tags"
          variant="outlined"
          fullWidth
          onChange={(e) => setOptions({ ...options, tags: e.target.value.split(",") })}
          autoComplete="new-password"
        />
      </Grid>
    </Grid>
  )
}

export default NodeOptions
