import { Box, Button, Divider, IconButton, TextField, Tooltip, Typography } from "@mui/material"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import React, { useContext } from "react"
import { useMutation, useQuery } from "react-query"

import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import BgContainer from "../components/BgContainer"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { PluginContext } from "../contexts/PluginContext"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useSnackbar } from "notistack"

// TODO: Cleanup file
// TODO: Improve layout
// TODO: Better tooltips & add placeholders
// TODO: Improve update checking logic
// ? include "train" support for prereleases?
// ? Can the useFieldArrays be simplified?

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
      tooltip: "Authentication credentials for node Redfish login",
      fields: [
        { name: "Username", value: "bmc.username", options: {} },
        { name: "Password", value: "bmc.password", options: { type: "password" } },
      ],
    },
    {
      category: "Refresh Interval",
      tooltip: "Number of minutes to automatically refresh all redfish queries. (Set to 0 to disable)",
      fields: [{ name: "Minutes", value: "bmc.refresh_interval", options: { type: "number" } }],
    },
    {
      category: "Switches",
      tooltip: "Authentication credentials for switch SSH login. Private keys can also be used, path must be absolute",
      fields: [
        { name: "Username", value: "switches.username", options: {} },
        { name: "Password", value: "switches.password", options: { type: "password" } },
        { name: "Private Key Path", value: "switches.private_key_path", options: {} },
      ],
    },
    {
      category: "OpenManage",
      tooltip: "OpenManage Enterprise appliance credentials and host address",
      fields: [
        { name: "Username", value: "openmanage.username", options: {} },
        { name: "Password", value: "openmanage.password", options: { type: "password" } },
        { name: "Address", value: "openmanage.address", options: {} },
      ],
    },
    {
      category: "Warranty API",
      tooltip: "Dell developer warranty API credentials",
      fields: [
        { name: "ID", value: "dell_warranty_api.id", options: { type: "password" } },
        { name: "Secret", value: "dell_warranty_api.secret", options: { type: "password" } },
      ],
    },
    {
      category: "Multiple Floorplan Tag Mapping",
      tooltip: "Floorplan color for if a rack has multiple matching tags",
      fields: [
        { name: "Tag", value: "floorplan.tag_multiple.tag", options: {} },
        { name: "Color", value: "floorplan.tag_multiple.color", options: {} },
      ],
    },
    {
      category: "Floorplan Tag Colors",
      tooltip: "Default floorplan tag colors",
      fields: [
        { name: "Default", value: "floorplan.default_color", options: {} },
        { name: "Secondary", value: "floorplan.secondary_color", options: {} },
      ],
    },
    {
      category: "Rack Config",
      tooltip: "Size of table rendered in Rack page",
      fields: [
        { name: "Max U", value: "rack.max", options: { type: "number" } },
        { name: "Min U", value: "rack.min", options: { type: "number" } },
      ],
    },
  ]
  const settings_form_arr = [
    {
      category: "Firmware Versions",
      tooltip: "Regex match and firmware versions for nodes rendered in Rack. Set to the latest versions",
      fields: firmware_fields,
      prefix: "bmc.firmware_versions",
      add_fields: firmware_append,
      remove_fields: firmware_remove,
      contains: { name: "", model: "", bios: "", bmc: "" },
    },
    {
      category: "Floorplan Tag Mapping",
      tooltip: 'Match Grendel tags to colors when the "Color" option is selected in Floorplan',
      fields: tag_mapping_fields,
      prefix: "floorplan.tag_mapping",
      add_fields: tag_mapping_append,
      remove_fields: tag_mapping_remove,
      contains: { tag: "", color: "" },
    },
    {
      category: "Switch Model Colors",
      tooltip: "Regex match and color configuration for switches displayed in Floorplan",
      fields: model_color_fields,
      prefix: "floorplan.model_color",
      add_fields: model_color_append,
      remove_fields: model_color_remove,
      contains: { display: "", color: "", model: "" },
    },
    {
      category: "Switch Version Color",
      tooltip: "Changes the colors displayed in Floorplan when the display: Switch Version is selected",
      fields: version_color_fields,
      prefix: "floorplan.version_color",
      add_fields: version_color_append,
      remove_fields: version_color_remove,
      contains: { display: "", color: "", version: "" },
    },
    {
      category: "Node Prefixes",
      tooltip: "Sets the node prefix used for different node types",
      fields: rack_prefix_fields,
      prefix: "rack.prefix",
      add_fields: rack_prefix_append,
      remove_fields: rack_prefix_remove,
      contains: { type: "", prefix: "" },
    },
    {
      category: "Node Sizes",
      tooltip: "Sets how nodes are rendered in the Rack view when their API is reachable",
      fields: node_size_fields,
      prefix: "rack.node_size",
      add_fields: node_size_append,
      remove_fields: node_size_remove,
      contains: { models: "", height: 1, width: 1 },
    },
  ]

  const mutation = useMutation({
    mutationFn: (data) => {
      // quick fix for converting prefix string to arr
      data.rack.prefix = data.rack.prefix.map((val) => {
        if (typeof val.prefix === "string") return { type: val.type, prefix: val.prefix.split(",") }
        else return { ...val }
      })
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      return fetch(`${apiConfig.apiUrl}/client/v1/settings`, payload)
    },
    onError: async (error, variables, context) => {
      let error_json = await error.json()
      enqueueSnackbar(error_json.message, { variant: "error" })
      console.error(error_json.error)
    },
    onSuccess: async (data, variables, context) => {
      let data_json = await data.json()
      enqueueSnackbar(data_json.message, { variant: "success" })
    },
  })
  const onSubmit = async (data) => {
    mutation.mutate(data)
  }
  return (
    <BgContainer>
      <Grid2 container spacing={2} sx={{ marginTop: "20px" }}>
        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography fontSize={18}>Heorot version: {plugins.version}</Typography>
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
      <Divider sx={{ marginTop: "20px", marginBottom: "20px" }} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          <Grid2
            xs={12}
            sx={{ display: "flex", margin: "20px", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h2" fontSize={22}>
              Application Settings:
            </Typography>
            <Box sx={{ display: "flex", gap: "5px" }}>
              <Button variant="outlined" size="small" type="submit">
                Submit
              </Button>
              <Button variant="outlined" size="small" color="warning" onClick={() => reset()}>
                Reset
              </Button>
            </Box>
          </Grid2>
          {settings_form.map((item, index) => (
            <React.Fragment key={index}>
              <Grid2 xs={12}>
                {item.category}
                <Tooltip title={item.tooltip} placement="bottom">
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ width: "20px", height: "20px" }} />
                  </IconButton>
                </Tooltip>
                <Grid2 container spacing={1} sx={{ marginTop: "5px" }}>
                  {item.fields.map((settings_field, index) => (
                    <Grid2 key={index}>
                      <Controller
                        name={settings_field.value}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField size="small" {...field} label={settings_field.name} {...settings_field.options} />
                        )}
                      />
                    </Grid2>
                  ))}
                </Grid2>
              </Grid2>
            </React.Fragment>
          ))}
          {settings_form_arr.map((item, index) => (
            <React.Fragment key={index}>
              <Grid2 xs={12}>
                {item.category}
                <Tooltip title={item.tooltip} placement="bottom">
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ width: "20px", height: "20px" }} />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => item.add_fields(item.contains)}>
                  <AddOutlinedIcon />
                </IconButton>
              </Grid2>
              <Grid2 xs={12}>
                {item.fields.map((settings_field, index) => (
                  <Grid2 container spacing={1} key={settings_field.id}>
                    {Object.keys(settings_field)
                      .filter((val) => val !== "id")
                      .map((val) => (
                        <Grid2 key={item.id + "-" + val}>
                          <Controller
                            name={`${item.prefix}.${index}.${val}`}
                            control={control}
                            render={({ field }) => <TextField size="small" {...field} label={val} fullWidth />}
                          />
                        </Grid2>
                      ))}
                    <Grid2>
                      <IconButton onClick={() => item.remove_fields(index)}>
                        <CloseOutlinedIcon />
                      </IconButton>
                    </Grid2>
                  </Grid2>
                ))}
              </Grid2>
            </React.Fragment>
          ))}
        </Grid2>
      </form>
    </BgContainer>
  )
}

export default Settings
