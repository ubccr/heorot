import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogTitle, FormControlLabel } from "@mui/material"
import { useContext, useState } from "react"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const ResetBmc = ({ node }) => {
  const [openNode, setOpenNode] = useState(false)
  const [pxe, setPxe] = useState(false)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const resetNodeQuery = useQuery(
    ["resetNode", node, pxe],
    async ({ signal }) => {
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/redfish/v1/resetNode/${node}/${pxe}`, payload)).json()
      enqueueSnackbar(res.message, { variant: res.status })
      setOpenNode(false)
      return res
    },
    { enabled: false }
  )
  return (
    <>
      <Button variant="outlined" onClick={() => setOpenNode(true)}>
        Reboot Node
      </Button>
      <Dialog open={openNode} onClose={() => setOpenNode(false)}>
        <DialogTitle>Are you sure you want to powercycle {node}?</DialogTitle>
        <DialogActions>
          <FormControlLabel control={<Checkbox value={pxe} onClick={() => setPxe(!pxe)} />} label="PXE boot" />
          <Button variant="outlined" color="warning" onClick={() => resetNodeQuery.refetch()}>
            {resetNodeQuery.isFetching && <CircularProgress size={14} color="inherit" sx={{ marginRight: "5px" }} />}
            PowerCycle
          </Button>
          <Button variant="outlined" onClick={() => setOpenNode(false)} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResetBmc
