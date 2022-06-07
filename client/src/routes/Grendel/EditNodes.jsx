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
} from "@mui/material"
import { useSnackbar } from "notistack"

import { UserContext } from "../../contexts/UserContext"
import { apiPort } from "../../config"

const EditNodes = () => {
  const [formValues, setFormValues] = useState({ action: "", actionValue: "" })
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
      let url = `https://${window.location.hostname}:${apiPort}/grendel/`
      let nodeset = formValues.nodeset
      if (formValues.action === "provision") {
        if (formValues.actionValue === "true") url += `provision/${nodeset}`
        else if (formValues.actionValue === "false")
          url += `unprovision/${nodeset}`
      } else if (formValues.action === "tags")
        url += `tag/${nodeset}/${formValues.tags}`
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
  function validateForm() {
    const { nodeset, action, actionValue, tags } = formValues
    const formErrors = {}

    if (!nodeset || nodeset === "")
      formErrors.nodeset = "Nodeset cannot be blank"
    else if (action === "") formErrors.action = "Action cannot be blank"
    else if (actionValue === "" && action === "provision")
      formErrors.actionValue = "Value cannot be blank"
    else if (!tags && action === "tags")
      formErrors.tags = "Tags cannot be blank"

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
                }}
              >
                <MenuItem value={"provision"}>Set Provision</MenuItem>
                <MenuItem value={"tags"}>Set Tags</MenuItem>
              </Select>
              <FormHelperText error>{formError.action}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs>
            {formValues.action == "provision" && (
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
            {formValues.action !== "provision" && (
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
