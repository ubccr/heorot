import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material"
import React, { useContext, useState } from "react"
import { useMutation, useQuery } from "react-query"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useSnackbar } from "notistack"

const RackActions = ({ nodes }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [user] = useContext(UserContext)
  const [action, setAction] = useState("")
  const [data, setData] = useState("")
  const [tags, setTags] = useState({ tags: "", action: "tag" })
  const [provision, setProvision] = useState("provision")
  const [image, setImage] = useState("")
  const [pxe, setPxe] = useState(false)
  const [open, setOpen] = useState(false)
  const [nodeAction, setNodeAction] = useState("")

  const query = useQuery(
    ["rackActionsQuery", nodes, action, data],
    async ({ signal }) => {
      let url = apiConfig.apiUrl + "/grendel"
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        signal,
      }
      if (action === "image") {
        payload.body = JSON.stringify({ nodeset: nodes, action: "image", value: data })
        payload.method = "POST"
        url += "/edit"
      } else url += `/${action}/${nodes}${data}`

      const res = await (await fetch(url, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: res.status })
      else
        enqueueSnackbar(
          `Successfully changed "${action.replace(/^un/, "")}" attribute on ${res.result.hosts} host(s)`,
          {
            variant: res.status,
          }
        )
      return res
    },
    { enabled: false }
  )
  const redfish_query = useQuery(
    ["rackActionsRedfishQuery", nodes, nodeAction, pxe],
    async ({ signal }) => {
      let url = `${apiConfig.apiUrl}/redfish/v1/${nodeAction}/${nodes}`
      if (nodeAction === "resetNode") url += `/${pxe ? "true" : "false"}`
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }

      const res = await (await fetch(url, payload)).json()
      enqueueSnackbar(res.message, { variant: res.status })
      if (res.status === "error") console.error("redfish_query errors:", res.error)
      return res
    },
    { enabled: false }
  )

  const image_query = useQuery("rackActionsImage", async ({ signal }) => {
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
  const handleSubmit = async (action, data) => {
    if (action === "tags") {
      setAction(data.action)
      setData("/" + data.tags.replace(/\s/g, ""))
    } else if (action === "provision") {
      setAction(data)
      setData("")
    } else {
      setAction(action)
      setData(data)
    }
    await new Promise((resolve) => setTimeout(resolve, 50)) // timeout to fix weird query behavior
    query.refetch()
  }
  const handleNodeAction = async (action) => {
    setNodeAction(action)
    await new Promise((resolve) => setTimeout(resolve, 50)) // timeout to fix weird query behavior
    redfish_query.refetch()
    setOpen(false)
  }
  // Bad req fix
  const badReqFix = useMutation({
    mutationFn: (data) => {
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      return fetch(`${apiConfig.apiUrl}/redfish/v1/badReqFix/${nodes}`, payload)
    },
    onError: async (error, variables, context) => {
      let error_json = await error.json()
      enqueueSnackbar(error_json.message, { variant: error_json.status })
      console.error(error_json.error)
    },
    onSuccess: async (data, variables, context) => {
      let data_json = await data.json()
      enqueueSnackbar(data_json.message, { variant: data_json.status })
      if (data_json.error?.length > 0) console.error(data_json.error)
    },
  })
  return (
    <>
      <Box sx={{ padding: "5px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              onChange={(event) => setTags({ ...tags, tags: event.target.value })}
              variant="outlined"
              size="small"
              label="Tags"
              placeholder="z01, gpu, 2u"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
            <RadioGroup defaultValue={"tag"} row onChange={(event) => setTags({ ...tags, action: event.target.value })}>
              <FormControlLabel value="tag" control={<Radio size="small" />} label="Add" />
              <FormControlLabel value="untag" control={<Radio size="small" />} label="Remove" />
            </RadioGroup>
          </Grid>
          <Grid item xs={6} sm={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={() => handleSubmit("tags", tags)} variant="outlined">
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6} sm={10} sx={{ display: "flex", justifyContent: "center" }}>
            <RadioGroup defaultValue={"provision"} row onChange={(event) => setProvision(event.target.value)}>
              <FormControlLabel value="provision" control={<Radio size="small" />} label="Provision" />
              <FormControlLabel value="unprovision" control={<Radio size="small" />} label="Unprovision" />
            </RadioGroup>
          </Grid>
          <Grid item xs={6} sm={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={() => handleSubmit("provision", provision)} variant="outlined">
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6} sm={10}>
            {image_query.isFetched && image_query.data.status === "success" && (
              <Select
                value={image}
                onChange={(event) => setImage(event.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {image_query.data.result.map((val, index) => {
                  return (
                    <MenuItem value={val.name} key={index}>
                      {val.name}
                    </MenuItem>
                  )
                })}
              </Select>
            )}
          </Grid>
          <Grid item xs={6} sm={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={() => handleSubmit("image", image)} variant="outlined">
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
            {redfish_query.isFetching && <LinearProgress color="primary" />}
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", gap: "5px" }}>
            <Button variant="outlined" onClick={() => badReqFix.mutate()}>
              {badReqFix.isLoading ? <CircularProgress color="primary" size={15} /> : "Fix Bad Request Error"}
            </Button>
            <Button variant="outlined" onClick={() => handleNodeAction("clearSel")}>
              Clear SELs
            </Button>
            <Button variant="outlined" onClick={() => handleNodeAction("resetBmc")}>
              Reset BMCs
            </Button>
            <Button variant="outlined" color="warning" onClick={() => setOpen(true)}>
              Reboot Nodes
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={open}>
        <DialogTitle>Please confirm selection:</DialogTitle>
        <DialogContent>{nodes}</DialogContent>
        <DialogActions>
          <FormControlLabel
            control={<Checkbox value={pxe} onClick={(event) => setPxe(!pxe)} />}
            label="PXE boot"
            sx={{ marginLeft: "5px" }}
          />
          <Button variant="outlined" color="error" onClick={() => handleNodeAction("resetNode")}>
            Power cycle
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RackActions
