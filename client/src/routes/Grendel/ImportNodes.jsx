import { Button, Checkbox, FormGroup, Grid, TextField } from "@mui/material"
import React, { useContext, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const ImportNodes = () => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  let textFieldProps = { fullWidth: true, autoComplete: "new-password", variant: "outlined", size: "small" }
  let buttonProps = { variant: "outlined" }

  const [sw, setSw] = useState("")
  const [bmcSw, setBmcSw] = useState("")
  const [field, setField] = useState("")

  let tmp = [
    { label: "Switch", placeholder: "swe-z01-22", onChange: (e) => setSw(e.target.value), ...textFieldProps },
    { label: "BMC Switch", placeholder: "swe-z01-42", onChange: (e) => setBmcSw(e.target.value), ...textFieldProps },
    { label: "Firmware", ...textFieldProps },
    { label: "Boot Image", ...textFieldProps },
    { label: "Provision", ...textFieldProps },
    { label: "Tags", placeholder: "ubhpc,z01,gpu", ...textFieldProps },
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
    let mapping = field.split("\n").map((node) => node.split(":").map((port) => port.split(",")))

    let swQueryRes = null
    let swBmcQueryRes = null
    if (sw !== "") swQueryRes = await switchQuery.refetch()
    if (bmcSw !== "") swBmcQueryRes = await switchBmcQuery.refetch()

    if (swQueryRes.status === "success" && swQueryRes.data.status === "success") {
      mapping.map((map) => {
        let MAT = swQueryRes.data.result[2].output
        let port = MAT.map((val) => {
          if (val.port === map[1][0]) return val
        }).filter(Boolean)
        console.log(port)
      })
    }
  }
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
  return (
    <>
      <FormGroup>
        <Grid container spacing={2}>
          {tmp.map((val, index) => (
            <Grid item xs={4} key={index}>
              <TextField {...val} />
            </Grid>
          ))}
          <Grid item xs={12}></Grid>
          <Grid item xs={4}>
            <TextField
              placeholder="(Node:Port1,Port2) ex: cpn-z01-01:20,28"
              onKeyUp={(e) => setField(e.target.value)}
              fullWidth
              multiline
            />
          </Grid>
          <Grid item xs={2}>
            <Button {...buttonProps} onClick={handleQuery}>
              Query Switches
            </Button>
          </Grid>
        </Grid>
      </FormGroup>
    </>
  )
}

export default ImportNodes
