import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material"
import { useContext, useState } from "react"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Actions = ({ node }) => {
  const [user] = useContext(UserContext)
  const [openNode, setOpenNode] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const clearSelQuery = useQuery(
    "clearSel",
    async ({ signal }) => {
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/clearSEL/${node}`, payload)
      ).json()
      enqueueSnackbar(res.message, { variant: res.status })
      return res
    },
    { enabled: false }
  )

  const resetBmcQuery = useQuery(
    "resetBmc",
    async ({ signal }) => {
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/resetBmc/${node}`, payload)
      ).json()
      enqueueSnackbar(res.message, { variant: res.status })
      return res
    },
    { enabled: false }
  )

  const resetNodeQuery = useQuery(
    "resetNode",
    async ({ signal }) => {
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/resetNode/${node}`, payload)
      ).json()
      enqueueSnackbar(res.message, { variant: res.status })
      setOpenNode(false)
      return res
    },
    { enabled: false }
  )

  return (
    <Grid
      container
      sx={{
        overflow: "hidden",
        padding: "10px",
        marginTop: "12px",
        alignItems: "center",
        border: 1,
        borderRadius: "10px",
        borderColor: "border.main",
        bgcolor: "background.main",
        color: "text.primary",
        boxShadow: 12,
        minHeight: 60,
      }}
    >
      <Grid item xs>
        <Typography variant="h2" sx={{ fontSize: "18pt", paddingLeft: 2 }}>
          Actions:
        </Typography>
      </Grid>

      <Grid item xs sx={{ textAlign: "end" }}>
        <Button variant="outlined" onClick={() => clearSelQuery.refetch()}>
          {clearSelQuery.isFetching && (
            <CircularProgress
              size={14}
              color="inherit"
              sx={{ marginRight: "5px" }}
            />
          )}
          Clear SEL
        </Button>{" "}
        <Button variant="outlined" onClick={() => resetBmcQuery.refetch()}>
          {resetBmcQuery.isFetching && (
            <CircularProgress
              size={14}
              color="inherit"
              sx={{ marginRight: "5px" }}
            />
          )}
          Reset BMC
        </Button>{" "}
        <Button variant="outlined" onClick={() => setOpenNode(true)}>
          Reboot Node
        </Button>
      </Grid>

      <Dialog open={openNode} onClose={() => setOpenNode(false)}>
        <DialogTitle>Are you sure you want to powercycle {node}?</DialogTitle>
        <DialogActions>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => resetNodeQuery.refetch()}
          >
            {resetNodeQuery.isFetching && (
              <CircularProgress
                size={14}
                color="inherit"
                sx={{ marginRight: "5px" }}
              />
            )}
            PowerCycle
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenNode(false)}
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default Actions
