import { Button, IconButton, TextField, Typography } from "@mui/material"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import React, { useContext } from "react"

import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import BgContainer from "../components/BgContainer"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
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

  const {
    fields: tag_mapping_fields,
    append: tag_mapping_append,
    remove: tag_mapping_remove,
  } = useFieldArray({
    control,
    name: "floorplan.tag_mapping",
  })
  const {
    fields: model_color_fields,
    append: model_color_append,
    remove: model_color_remove,
  } = useFieldArray({
    control,
    name: "floorplan.model_color",
  })
  const {
    fields: version_color_fields,
    append: version_color_append,
    remove: version_color_remove,
  } = useFieldArray({
    control,
    name: "floorplan.version_color",
  })
  const {
    fields: rack_prefix_fields,
    append: rack_prefix_append,
    remove: rack_prefix_remove,
  } = useFieldArray({
    control,
    name: "rack.prefix",
  })
  const {
    fields: node_size_fields,
    append: node_size_append,
    remove: node_size_remove,
  } = useFieldArray({
    control,
    name: "rack.node_size",
  })

  const settings_form = [
    {
      category: "BMC",
      fields: [
        { name: "Username", value: "bmc.username", options: {} },
        { name: "Password", value: "bmc.password", options: { type: "password" } },
      ],
    },
    {
      category: "Switches",
      fields: [
        { name: "Username", value: "switches.username", options: {} },
        { name: "Password", value: "switches.password", options: { type: "password" } },
        { name: "Private Key Path", value: "switches.private_key_path", options: {} },
      ],
    },
    {
      category: "OpenManage",
      fields: [
        { name: "Username", value: "openmange.username", options: {} },
        { name: "Password", value: "openmange.password", options: { type: "password" } },
        { name: "Address", value: "openmange.address", options: {} },
      ],
    },
    {
      category: "Multiple Floorplan Tag Mapping",
      fields: [
        { name: "Tag", value: "floorplan.tag_multiple.tag", options: {} },
        { name: "Color", value: "floorplan.tag_multiple.color", options: {} },
      ],
    },
    {
      category: "Floorplan Tag Colors",
      fields: [
        { name: "Default", value: "floorplan.default_color", options: {} },
        { name: "Secondary", value: "floorplan.secondary_color", options: {} },
      ],
    },
    {
      category: "Rack Config",
      fields: [
        { name: "Max U", value: "rack.max", options: { type: "number" } },
        { name: "Min U", value: "rack.min", options: { type: "number" } },
      ],
    },
    {
      category: "Firmware Versions",
      fields: firmware_fields,
      prefix: "bmc.firmware_versions",
      add_fields: firmware_append,
      remove_fields: firmware_remove,
      contains: { name: "", model: "", bios: "", bmc: "" },
    },
    {
      category: "Floorplan Tag Mapping",
      fields: tag_mapping_fields,
      prefix: "floorplan.tag_mapping",
      add_fields: tag_mapping_append,
      remove_fields: tag_mapping_remove,
      contains: { tag: "", color: "" },
    },
    {
      category: "Switch Model Colors",
      fields: model_color_fields,
      prefix: "floorplan.model_color",
      add_fields: model_color_append,
      remove_fields: model_color_remove,
      contains: { display: "", color: "", model: "" },
    },
    {
      category: "Switch Version Color",
      fields: version_color_fields,
      prefix: "floorplan.version_color",
      add_fields: version_color_append,
      remove_fields: version_color_remove,
      contains: { display: "", color: "", version: "" },
    },
    {
      category: "Node Prefixes",
      fields: rack_prefix_fields,
      prefix: "rack.prefix",
      add_fields: rack_prefix_append,
      remove_fields: rack_prefix_remove,
      contains: { type: "", prefix: "" },
    },
    {
      category: "Node Sizes",
      fields: node_size_fields,
      prefix: "rack.node_size",
      add_fields: node_size_append,
      remove_fields: node_size_remove,
      contains: { models: "", height: 1, width: 1 },
    },
  ]

  const onSubmit = async (data) => {}
  return (
    <BgContainer>
      <div>Settings</div>
      <Grid2 container spacing={2}>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography>Heorot version: {plugins.version}</Typography>
        </Grid2>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" size="small" onClick={() => query_updates.refetch()}>
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
          {settings_form.map((item, index) => (
            <React.Fragment key={index}>
              <Grid2 xs={item.prefix ? 12 : 6}>
                {item.category}
                {item.prefix && (
                  <IconButton onClick={() => item.add_fields(item.contains)}>
                    <AddOutlinedIcon />
                  </IconButton>
                )}
              </Grid2>
              <Grid2 xs={item.prefix ? 12 : 6}>
                {item.fields.map((settings_field, index) => {
                  if (item.prefix !== undefined) {
                    // settings in Array
                    return (
                      <Grid2 container spacing={2} key={settings_field.id}>
                        {Object.keys(settings_field)
                          .filter((val) => val !== "id")
                          .map((val) => (
                            <Grid2 xs={2} key={item.id + "-" + val}>
                              <Controller
                                name={`${item.prefix}.${index}.${val}`}
                                control={control}
                                render={({ field }) => <TextField size="small" {...field} label={val} fullWidth />}
                              />
                            </Grid2>
                          ))}
                        <Grid2 xs={2}>
                          <IconButton onClick={() => item.remove_fields(index)}>
                            <CloseOutlinedIcon />
                          </IconButton>
                        </Grid2>
                      </Grid2>
                    )
                  } else {
                    // settings in Object
                    return (
                      <Controller
                        name={settings_field.value}
                        key={index}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField size="small" {...field} label={settings_field.name} {...settings_field.options} />
                        )}
                      />
                    )
                  }
                })}
              </Grid2>
            </React.Fragment>
          ))}
        </Grid2>
      </form>
    </BgContainer>
  )
}

export default Settings
