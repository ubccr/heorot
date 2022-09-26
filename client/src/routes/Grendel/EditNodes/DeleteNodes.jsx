import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from "@mui/material"
import { useContext, useState } from "react"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const DeleteNodes = () => {
  const [user] = useContext(UserContext)
  const [nodeset, setNodeset] = useState("")
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["delete", nodeset],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/delete/${nodeset}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "success") {
        console.log(res)
        enqueueSnackbar(`Successfully removed ${res.result.hosts} host(s)`, { variant: "success" })
        setOpen(false)
        setNodeset("")
      }
      return res
    },
    { enabled: false }
  )

  const handleOpen = () => {
    if (nodeset !== "") setOpen(true)
    else enqueueSnackbar("Please enter a valid nodeset", { variant: "error" })
  }
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "16pt", marginTop: "20px" }}>
        Delete Nodes:
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          padding: "10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid item xs={6} md={2}>
          <TextField
            label="Nodeset"
            placeholder="cpn-z01-01"
            value={nodeset}
            // size="small"
            onChange={(e) => setNodeset(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <Button variant="outlined" color="warning" onClick={handleOpen}>
            Submit
          </Button>
        </Grid>
      </Grid>

      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle>Please confirm actions:</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently remove <b>{nodeset}</b>?
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={() => query.refetch()}>
            Delete
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeleteNodes
