import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import { useContext, useState } from "react"

import CloseIcon from "@mui/icons-material/Close"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Status = ({ open, setOpen }) => {
  const [user] = useContext(UserContext)
  const [value, setValue] = useState("short")
  const [tags, setTags] = useState("")

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
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/status/${value}/${tags}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: !!user }
  )
  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          setTags("")
        }}
        maxWidth="lg"
        scroll="paper"
      >
        <DialogTitle>
          Grendel Status
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpen(false)
              setTags("")
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {query.isFetched && query.data.status === "success" && (
            <pre style={{ fontFamily: "Roboto Mono" }}>{query.data.result}</pre>
          )}
        </DialogContent>
        <DialogActions>
          <TextField
            size="small"
            label="Tags"
            placeholder="ex: a01,gpu"
            onChange={(e) => setTags(e.target.value)}
            sx={{ width: "150px" }}
          />
          <ToggleButtonGroup exclusive value={value} color="primary" size="small" sx={{ marginRight: "8px" }}>
            <ToggleButton value="short" onClick={(e) => setValue(e.target.value)}>
              Short
            </ToggleButton>
            <ToggleButton value="nodes" onClick={(e) => setValue(e.target.value)}>
              Nodes
            </ToggleButton>
            <ToggleButton value="long" onClick={(e) => setValue(e.target.value)}>
              Long
            </ToggleButton>
          </ToggleButtonGroup>

          <Button variant="outlined" onClick={() => query.refetch()}>
            Refresh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Status
