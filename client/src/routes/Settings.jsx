import { Button, TextField, Typography } from "@mui/material"
import React, { useContext } from "react"

import BgContainer from "../components/BgContainer"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { PluginContext } from "../contexts/PluginContext"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [plugins] = useContext(PluginContext)

  const query = useQuery(
    ["lastest-version"],
    async ({ signal }) => {
      const raw_res = await fetch("https://api.github.com/repos/ubccr/heorot/releases", { signal })
      const res = await raw_res.json()
      if (raw_res.status === 200) {
        let latest = res.find((val) => val.prerelease === false)
        if (latest.tag_name !== `v${plugins.version}`) return latest
        else {
          enqueueSnackbar("No new updates found!", { variant: "success" })
          return null
        }
      } else {
        enqueueSnackbar("Failed to fetch the latest version from GitHub", { variant: "error" })
        throw new Error(JSON.stringify(res))
      }
    },
    { enabled: false, retry: 0 }
  )
  return (
    <BgContainer>
      <div>Settings</div>
      <Grid2 container>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography>Heorot version: {plugins.version}</Typography>
        </Grid2>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" size="small" onClick={() => query.refetch()}>
            Check for Updates
          </Button>
        </Grid2>

        {query.isSuccess && query.data !== null && (
          <>
            <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
              <Typography>Update notes:</Typography>
            </Grid2>
            <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
              <TextField value={query.data.body} multiline fullWidth />
            </Grid2>
          </>
        )}
      </Grid2>
    </BgContainer>
  )
}

export default Settings
