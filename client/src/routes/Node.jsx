import { Box, IconButton, LinearProgress, Tab, Tabs, Typography } from "@mui/material"
import React, { useContext } from "react"
import { useNavigate, useParams } from "react-router-dom"

import BgContainer from "../components/BgContainer"
import Console from "./Node/Console"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grendel from "./Node/Grendel"
import Notes from "./Node/Notes"
import Redfish from "./Node/Redfish"
import Switches from "./Node/Switches"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"
import { useState } from "react"

const Node = () => {
  const [tab, setTab] = useState(0)
  const { node } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  let navigate = useNavigate()

  const [user] = useContext(UserContext)

  const prevNode = () => {
    navigate(`/Node/${query.data.previous_node}`)
  }
  const nextNode = () => {
    navigate(`/Node/${query.data.next_node}`)
  }

  const query = useQuery([`node-query-${node}`, node], async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/node/${node}`, payload)).json()
    if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
    else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)
    else if (res.message !== undefined) enqueueSnackbar(res.message, { variant: "warning" })

    return res
  })
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "26pt",
            textAlign: "center",
            marginBottom: "16px",
            padding: "10px",
            border: 1,
            borderRadius: "10px",
            borderColor: "border.main",
            bgcolor: "background.main",
            color: "text.primary",
            boxShadow: 16,
          }}
        >
          <IconButton variant="outlined" disabled={query.isFetching} onClick={() => prevNode()} sx={{ float: "left" }}>
            <ExpandLessIcon />
          </IconButton>
          {node}
          <IconButton variant="outlined" disabled={query.isFetching} onClick={() => nextNode()} sx={{ float: "right" }}>
            <ExpandMoreIcon />
          </IconButton>
          {query.isFetching && <LinearProgress sx={{ marginTop: "5px" }} />}
        </Typography>
      </Box>
      <BgContainer>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="Grendel" />
            <Tab label="Console" />
            <Tab label="Redfish" />
            <Tab label="Notes" />
            {node.split("-")[0] === "swe" && <Tab label="Port Management" />}
          </Tabs>
        </Box>
        <Box sx={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
          {tab === 0 && query.isFetched && <Grendel query={query} />}
          {tab === 1 && query.isFetched && <Console node={node} query={query} />}
          {tab === 2 && query.isFetched && <Redfish query={query} />}
          {tab === 3 && query.isFetched && <Notes query={query} />}
          {tab === 4 && query.isFetched && <Switches query={query} />}
        </Box>
      </BgContainer>
    </>
  )
}

export default Node
