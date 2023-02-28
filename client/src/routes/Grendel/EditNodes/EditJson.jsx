import { Button, FormGroup, Grid, TextField, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import SearchC from "../../../components/AppBar/SearchC"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useSnackbar } from "notistack"

// TODO: change useEffect to query & add mutation

const EditJson = () => {
  const [editNode, setEditNode] = useState("")
  const [nodeJson, setNodeJson] = useState("")
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (editNode !== "") {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      fetch(`${apiConfig.apiUrl}/grendel/host/find/${editNode}`, payload)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success") setNodeJson(JSON.stringify(result.result, null, 4))
          else if (result.status === "error")
            enqueueSnackbar(`Failed to fetch node. Response: ${result.result.message}`, {
              variant: "error",
            })
        })
    } else setNodeJson("")
    return () => {
      setNodeJson("")
    }
  }, [editNode])

  const handleJson = () => {
    try {
      JSON.parse(nodeJson) // just to generate an error
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: nodeJson,
      }
      fetch(`${apiConfig.apiUrl}/grendel/host`, payload)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success") {
            enqueueSnackbar(`Successfully updated host: ${editNode}`, {
              variant: "success",
            })
          } else if (result.status === "error")
            enqueueSnackbar(`Failed to edit node. Response: ${result.result.message}`, {
              variant: "error",
            })
        })
    } catch (e) {
      enqueueSnackbar(`Error in JSON syntax: ${e}`, { variant: "error" })
    }
  }
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "16pt", marginTop: "20px" }}>
        Edit JSON:
      </Typography>
      <Grid container spacing={2}>
        <Grid
          item
          xs={6}
          sx={{
            padding: "10px",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <SearchC action="value" setOutput={setEditNode} />
          <Button variant="outlined" disabled={!editNode} onClick={handleJson}>
            Submit
          </Button>
        </Grid>
        <Grid item xs={12}>
          <FormGroup sx={{ marginRight: "10px", marginLeft: "10px" }}>
            <TextField
              value={nodeJson}
              multiline
              fullWidth
              maxRows={25}
              onChange={(e) => {
                setNodeJson(e.target.value)
              }}
            />
          </FormGroup>
        </Grid>
      </Grid>
    </>
  )
}

export default EditJson
