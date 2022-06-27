import { useState, useContext } from "react"
import {
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText,
  Skeleton,
} from "@mui/material"
import { useSnackbar } from "notistack"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"

const EditNodes = () => {
  const [formValues, setFormValues] = useState({
    action: "",
    actionValue: "",
    value: "",
  })
  const [formError, setFormError] = useState(false)

  const [user, setUser] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const setField = (field, value) => {
    setFormValues({
      ...formValues,
      [field]: value,
    })
    if (!!formError[field])
      setFormError({
        ...formError,
        [field]: null,
      })
  }
  const handleSubmit = (event) => {
    event.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) setFormError(newErrors)
    else {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      let url = `${apiConfig.apiUrl}/grendel/`
      let nodeset = formValues.nodeset

      if (formValues.action === "provision") {
        if (formValues.actionValue === "true") url += `provision/${nodeset}`
        else if (formValues.actionValue === "false")
          url += `unprovision/${nodeset}`
      } else if (formValues.action === "tags") {
        url += `tag/${nodeset}/${formValues.tags}`
      } else if (
        formValues.action === "firmware" ||
        formValues.action === "image"
      ) {
        url += `edit`
        payload = {
          method: "POST",
          headers: {
            "x-access-token": user.accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeset: formValues.nodeset,
            action: formValues.action,
            value: formValues.value,
          }),
        }
      }
      fetch(url, payload)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success")
            enqueueSnackbar(
              `Successfully edited ${result.result.hosts} host(s)`,
              { variant: "success" }
            )
          else if (result.status === "error")
            enqueueSnackbar(
              `Failed to fetch node. Response: ${result.result.message}`,
              {
                variant: "error",
              }
            )
        })
    }
  }
  const query = useQuery(
    "image",
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/grendel/image/list`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )

  function validateForm() {
    const { nodeset, action, actionValue, tags, value } = formValues
    const formErrors = {}

    if (!nodeset || nodeset === "")
      formErrors.nodeset = "Nodeset cannot be blank"
    else if (action === "") formErrors.action = "Action cannot be blank"
    else if (actionValue === "" && action === "provision")
      formErrors.actionValue = "Value cannot be blank"
    else if (!tags && action === "tags")
      formErrors.tags = "Tags cannot be blank"
    else if (!value) formErrors.value = "Value cannot be blank"

    return formErrors
  }
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "16pt" }}>
        Edit Nodes:
      </Typography>
      <form onSubmit={handleSubmit}>
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
              error={!!formError.nodeset}
              helperText={formError.nodeset}
              name="nodeset"
              label="Nodeset"
              placeholder="ex: cpn-z01-[03-32]"
              sx={{ width: "100%" }}
              onChange={(e) => setField("nodeset", e.target.value)}
            />
          </Grid>
          <Grid item xs>
            <FormControl fullWidth>
              <InputLabel id="select-label">Action</InputLabel>
              <Select
                error={!!formError.action}
                labelId="select-label"
                value={formValues["action"]}
                label="Action"
                onChange={(e) => {
                  setField("action", e.target.value)
                  if (e.target.value === "image") query.refetch()
                }}
              >
                <MenuItem value={"provision"}>Set Provision</MenuItem>
                <MenuItem value={"tags"}>Set Tags</MenuItem>
                <MenuItem value={"firmware"}>Set Firmware</MenuItem>
                <MenuItem value={"image"}>Set Boot Image</MenuItem>
              </Select>
              <FormHelperText error>{formError.action}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs>
            {formValues.action === "provision" && (
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="value-select-label">Value</InputLabel>
                <Select
                  error={!!formError.actionValue}
                  labelId="value-select-label"
                  value={formValues.actionValue}
                  label="Value"
                  onChange={(e) => {
                    setField("actionValue", e.target.value)
                  }}
                >
                  <MenuItem value={"true"}>True</MenuItem>
                  <MenuItem value={"false"}>False</MenuItem>
                </Select>
                <FormHelperText error>{formError.actionValue}</FormHelperText>
              </FormControl>
            )}
            {formValues.action === "tags" && (
              <TextField
                error={!!formError.tags}
                helperText={formError.tags}
                label="Value"
                placeholder="z01,ubhpc,gpu"
                sx={{ width: "100%" }}
                onChange={(e) => {
                  setField("tags", e.target.value)
                }}
              ></TextField>
            )}
            {formValues.action === "firmware" && (
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="firmware-select-label">Value</InputLabel>
                <Select
                  error={!!formError.value}
                  labelId="firmware-select-label"
                  value={formValues.value}
                  label="Value"
                  onChange={(e) => {
                    setField("value", e.target.value)
                  }}
                >
                  <MenuItem value={"ipxe-x86_64.efi"}>ipxe-x86_64.efi</MenuItem>
                  <MenuItem value={"snponly-x86_64.efi"}>
                    snponly-x86_64.efi
                  </MenuItem>
                </Select>
                <FormHelperText error>{formError.value}</FormHelperText>
              </FormControl>
            )}
            {formValues.action === "image" && query.isFetched && (
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="image-select-label">Value</InputLabel>
                <Select
                  error={!!formError.value}
                  labelId="image-select-label"
                  value={formValues.value}
                  label="Value"
                  onChange={(e) => {
                    setField("value", e.target.value)
                  }}
                >
                  {query.data.result.map((val, index) => (
                    <MenuItem value={val.name} key={index}>
                      {val.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error>{formError.value}</FormHelperText>
              </FormControl>
            )}
            {formValues.action === "image" && !query.isFetched && (
              <Skeleton variant="rectangle" height={60} animation="wave" />
            )}
            {formValues.action === "" && (
              <TextField placeholder="Please select an Action" disabled />
            )}
          </Grid>
          <Grid item xs>
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default EditNodes
