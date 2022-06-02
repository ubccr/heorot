import { useState, useEffect, useContext } from "react"
import {
  Typography,
  TextareaAutosize,
  FormGroup,
  Button,
  Grid,
  Box,
} from "@mui/material"
import SearchC from "../../components/AppBar/SearchC"
import { useSnackbar } from "notistack"

import { UserContext } from "../../contexts/UserContext"
import { apiPort } from "../../config"

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
      fetch(
        `https://${window.location.hostname}:${apiPort}/grendel/host/find/${editNode}`,
        payload
      )
        .then((res) => res.json())
        .then((result) => {
          if (result.grendelResponse === "success")
            setNodeJson(JSON.stringify(result.response, null, 4))
          else if (result.grendelResponse === "error")
            enqueueSnackbar(
              `Failed to fetch node. Response: ${result.response.message}`,
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
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: nodeJson,
      }
      fetch(
        `https://${window.location.hostname}:${apiPort}/grendel/host`,
        payload
      )
        .then((res) => res.json())
        .then((result) => {
          if (result.grendelResponse === "success") {
            enqueueSnackbar(`Successfully updated host: ${editNode}`, {
              variant: "success",
            })
          } else if (result.grendelResponse === "error")
            enqueueSnackbar(
              `Failed to edit node. Response: ${result.response.message}`,
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
        <TextareaAutosize
          style={{ padding: "5px", margin: "10px" }}
          value={nodeJson}
          onChange={(e) => {
            setNodeJson(e.target.value)
          }}
        />
      </FormGroup>
    </>
  )
}

export default EditJson
