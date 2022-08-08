import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"

import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Status = ({ open, setOpen }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["status", user],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/grendel/status`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: !!user }
  )

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Grendel Status</DialogTitle>
        <DialogContent>
          {query.isFetched && query.data.status === "success" && (
            <pre style={{ fontFamily: "Roboto Mono" }}>{query.data.result}</pre>
          )}
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  )
}

export default Status
