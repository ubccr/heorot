import { useState, useEffect, useContext } from "react"
import {
  Typography,
  TextareaAutosize,
  FormGroup,
  Button,
  Grid,
  Box,
  TextField,
} from "@mui/material"
import SearchC from "../../components/AppBar/SearchC"
import { useSnackbar } from "notistack"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"

const EditJson = () => {
  const [editNode, setEditNode] = useState("")
  const [nodeJson, setNodeJson] = useState("")
  const [user, setUser] = useContext(UserContext)
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
          if (result.status === "success")
            setNodeJson(JSON.stringify(result.result, null, 4))
          else if (result.status === "error")
            enqueueSnackbar(
              `Failed to fetch node. Response: ${result.result.message}`,
              {
                variant: "error",
              }
            )
        })
    } else setNodeJson("")
    return () => {
      setNodeJson("")
    }
  }, [editNode])

  const handleJson = () => {
    try {
      let a = JSON.parse(nodeJson) // just to generate an error
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
            enqueueSnackbar(
              `Failed to edit node. Response: ${result.result.message}`,
              {
                variant: "error",
              }
            )
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
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <SearchC action="value" setOutput={setEditNode} />
        <Button
          variant="outlined"
          sx={{ height: "36.5px" }}
          disabled={!editNode}
          onClick={handleJson}
        >
          Submit
        </Button>
      </Box>
      <FormGroup>
        <TextField
          value={nodeJson}
          multiline
          onChange={(e) => {
            setNodeJson(e.target.value)
          }}
          sx={{ margin: "10px" }}
        />
      </FormGroup>
    </>
  )
}

export default EditJson
