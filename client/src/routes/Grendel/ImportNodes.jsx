import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormGroup,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import React, { useContext, useState } from "react"

import QueryTextfield from "../../components/QueryTextfield"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const ImportNodes = () => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  let textFieldProps = {
    fullWidth: true,
    autoComplete: "new-password",
    variant: "outlined",
    size: "small",
  }
  let buttonProps = { variant: "outlined", sx: { marginLeft: "5px", marginRight: "5px" } }

  const [sw, setSw] = useState("")
  const [bmcSw, setBmcSw] = useState("")
  const [mappingField, setMappingField] = useState("")
  const [reviewJSON, setReviewJSON] = useState("")
  const [form, setForm] = useState({
    firmware: "",
    boot_image: "",
    provision: true,
    tags: "",
    domain: "",
  })

  const query = useQuery(
    "submitNewBulkNodes",
    async ({ signal }) => {
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: reviewJSON,
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/host`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "success")
        enqueueSnackbar(`Successfully added ${res.result.hosts} host.`, { variant: "success" })
      return res
    },
    { enabled: false }
  )

  const handleChange = (e, index) => {
    setForm({ ...form, [index]: e.target.value })
  }

  let itemRender = [
    {
      label: "Switch",
      placeholder: "swe-z01-22",
      name: "switch1",
      onChange: (e) => setSw(e.target.value),
      ...textFieldProps,
    },
    {
      label: "BMC Switch",
      placeholder: "(optional)",
      name: "switch2",
      onChange: (e) => setBmcSw(e.target.value),
      ...textFieldProps,
    },
    {
      label: "Domain",
      placeholder: "compute.cbls.ccr.buffalo.edu",
      name: "domain",
      onChange: (e) => handleChange(e, "domain"),
      ...textFieldProps,
    },
    {
      label: "Tags",
      placeholder: "ubhpc,z01,gpu",
      name: "tags",
      onChange: (e) => handleChange(e, "tags"),
      ...textFieldProps,
    },
    {
      select: true,
      label: "Firmware",
      endpoint: "/grendel/firmware/list",
      index: "firmware",
      value: form,
      setValue: setForm,
    },
    {
      select: true,
      label: "Boot Image",
      endpoint: "/grendel/image/list",
      index: "boot_image",
      dataIndex: "name",
      value: form,
      setValue: setForm,
    },
  ]

  const switchQuery = useQuery(
    ["bulkNodeImportSw", sw],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/query/${sw}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )
  const switchBmcQuery = useQuery(
    ["bulkNodeImportSwBmc", bmcSw],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/query/${bmcSw}/true`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )
  const handleQuery = async () => {
    let mapping = mappingField.split("\n").map((node) => node.split(":").map((port) => port.split(",")))

    let swQueryRes = null
    let swBmcQueryRes = null
    if (sw !== "") swQueryRes = await switchQuery.refetch()
    if (bmcSw !== "") swBmcQueryRes = await switchBmcQuery.refetch()

    if (swQueryRes !== null && swQueryRes.data.status === "success") {
      if (swQueryRes.data.result.length > 1 && swQueryRes.data.result[2].output.length > 1) {
        let nodeJSON = []
        mapping.map((map) => {
          let MAT = swQueryRes.data.result[2].output
          let port = MAT.map((val) => {
            if (val.port === map[1][0]) return val
          }).filter(Boolean)

          // Second bmc switch query
          if (
            swBmcQueryRes !== null &&
            swBmcQueryRes.data.status === "success" &&
            swBmcQueryRes.data.result.length > 1 &&
            swBmcQueryRes.data.result[2].output.length > 1
          ) {
            let bmcMAT = swBmcQueryRes.data.result[2].output
            let port2 = bmcMAT
              .map((val) => {
                if (val.port === map[1][1]) return val
              })
              .filter(Boolean)
            port.push(...port2)
          }

          // Regex & ip will need to be edited depending on network layout
          let ifaces = port.map((val) => {
            let bmc = false
            let ip = "10."
            let fqdn = ""
            if (val.vlan.match(/1[0-9]{3}/g)) {
              bmc = false
              ip += "64." // our node subnet
              fqdn = `${map[0][0]}.${form.domain}`
            } else if (val.vlan.match(/3[0-9]{3}/g)) {
              bmc = true
              ip += "128." // our bmc subnet
              fqdn = `bmc${map[0][0].substring(3)}.${form.domain}`
            }
            ip += val.vlan.slice(-2) + "."
            ip += val.port

            return {
              mac: val.mac,
              ip: ip,
              ifname: "",
              fqdn: fqdn,
              bmc: bmc,
            }
          })
          if (ifaces.length === 0) {
            ifaces.push({
              mac: "",
              ip: "0.0.0.0",
              ifname: "",
              fqdn: `${map[0][0]}.${form.domain}`,
              bmc: false,
            })
          }

          nodeJSON.push({
            name: map[0][0],
            provision: form.provision,
            firmware: form.firmware,
            boot_image: form.boot_image,
            tags: form.tags.split(",").map((val) => val.trim()),
            interfaces: ifaces,
          })
        })
        setReviewJSON(JSON.stringify(nodeJSON, null, 4))
      } else enqueueSnackbar("Error fetching Mac Address Tabe", { variant: "error" })
    }
  }
  const handleSubmit = () => {
    query.refetch()
  }
  return (
    <>
      <FormGroup>
        <Grid container spacing={2}>
          {itemRender.map((val, index) => (
            <Grid item xs={6} md={3} key={index}>
              {!val.hasOwnProperty("select") && <TextField {...val} />}
              {val.hasOwnProperty("select") && <QueryTextfield {...val} />}
            </Grid>
          ))}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Provision</InputLabel>
              <Select
                value={form.provision}
                label={"Provision"}
                onChange={(e) => setForm({ ...form, provision: e.target.value })}
                variant="outlined"
              >
                <MenuItem value={true}>true</MenuItem>
                <MenuItem value={false}>false</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            sx={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Button {...buttonProps} onClick={handleQuery}>
              Query Switches
              {(switchQuery.isFetching || switchBmcQuery.isFetching) && (
                <CircularProgress size={14} color="inherit" sx={{ marginLeft: "5px" }} />
              )}
            </Button>
            <Button {...buttonProps} onClick={handleSubmit}>
              Import Nodes
              {query.isFetching && <CircularProgress size={14} color="inherit" sx={{ marginLeft: "5px" }} />}
            </Button>
          </Grid>
          <Grid item xs={12}></Grid>
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="(Node:NIC1,BMC) ex: cpn-z01-01:20,28"
              onKeyUp={(e) => setMappingField(e.target.value)}
              maxRows={20}
              fullWidth
              multiline
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Generated JSON"
              maxRows={20}
              fullWidth
              multiline
              value={reviewJSON}
              onChange={(e) => setReviewJSON(e.target.value)}
            />
          </Grid>
        </Grid>
      </FormGroup>
    </>
  )
}

export default ImportNodes
