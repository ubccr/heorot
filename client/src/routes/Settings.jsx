import { Button, TextField, Typography } from "@mui/material"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import React, { useContext } from "react"

import BgContainer from "../components/BgContainer"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { PluginContext } from "../contexts/PluginContext"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [plugins] = useContext(PluginContext)
  const [user] = useContext(UserContext)

  // Heorot updates
  const query_updates = useQuery(
    ["latest-version"],
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

  // Settings form
  const { control, reset, getValues, setValue, watch, handleSubmit } = useForm({
    defaultValues: async () => {
      let data = await (
        await fetch(`${apiConfig.apiUrl}/client/v1/settings`, {
          headers: {
            "x-access-token": user.accessToken,
          },
        })
      ).json()
      console.log(data)
      return data[0]
    },
  })

  const {
    fields: firmware_fields,
    append: firmware_append,
    remove: firmware_remove,
  } = useFieldArray({
    control,
    name: "bmc.firmware_versions",
  })

  const onSubmit = async (data) => {}
  return (
    <BgContainer>
      <div>Settings</div>
      <Grid2 container spacing={2}>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography>Heorot version: {plugins.version}</Typography>
        </Grid2>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" size="small" onClick={() => query.refetch()}>
            Check for Updates
          </Button>
        </Grid2>

        {query_updates.isSuccess && query_updates.data !== null && (
          <>
            <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
              <Typography>Update notes:</Typography>
            </Grid2>
            <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
              <TextField size="small" value={query_updates.data.body} multiline fullWidth />
            </Grid2>
          </>
        )}
      </Grid2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>BMC</Grid2>
          <Grid2 xs={6}>
            <Controller
              name="bmc.username"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="username" />}
            />
            <Controller
              name="bmc.password"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="password" type="password" />}
            />
          </Grid2>
          <Grid2 xs={6}>Switches</Grid2>
          <Grid2 xs={6}>
            <Controller
              name="switches.username"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="username" />}
            />
            <Controller
              name="switches.password"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="password" type="password" />}
            />
            <Controller
              name="switches.private_key_path"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="Private key path" />}
            />
          </Grid2>
          <Grid2 xs={6}>Open Manage Enterprise</Grid2>
          <Grid2 xs={6}>
            <Controller
              name="openmanage.username"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="username" />}
            />
            <Controller
              name="openmanage.password"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="password" type="password" />}
            />
            <Controller
              name="openmanage.address"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="OME address" />}
            />
          </Grid2>
          <Grid2 xs={6}>Dell Warranty API</Grid2>
          <Grid2 xs={6}>
            <Controller
              name="dell_warranty_api.id"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="ID" type="password" />}
            />
            <Controller
              name="dell_warranty_api.secret"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField size="small" {...field} label="Secret" type="password" />}
            />
          </Grid2>
          {firmware_fields.map((item, index) => (
            <Grid2 xs={12} key={item.id}>
              <Controller
                name={`bmc.firmware_versions.${index}.name`}
                control={control}
                render={({ field }) => <TextField size="small" {...field} label="Name" />}
              />
              <Controller
                name={`bmc.firmware_versions.${index}.model`}
                control={control}
                render={({ field }) => <TextField size="small" {...field} label="Model" />}
              />
              <Controller
                name={`bmc.firmware_versions.${index}.bios`}
                control={control}
                render={({ field }) => <TextField size="small" {...field} label="BIOS version" />}
              />
              <Controller
                name={`bmc.firmware_versions.${index}.bmc`}
                control={control}
                render={({ field }) => <TextField size="small" {...field} label="BMC version" />}
              />
            </Grid2>
          ))}
        </Grid2>
      </form>
    </BgContainer>
  )
}

export default Settings
