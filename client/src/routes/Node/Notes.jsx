import { Box, Button, CircularProgress, TextField } from "@mui/material"
import React, { useContext, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useSnackbar } from "notistack"

const Notes = ({ query }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [pageRef] = useAutoAnimate(null)

  const [user] = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [overwrite, setOverwrite] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        node: query.data.node,
        old_notes: query.data.notes,
        new_notes: e.currentTarget.notes.value,
        overwrite: overwrite !== "" ? true : false,
      }),
    }
    let res = await (await fetch(`${apiConfig.apiUrl}/client/v1/notes`, payload)).json()
    setLoading(false)
    enqueueSnackbar(res.message, { variant: res.status })
    if (res?.code === "EOVERWRITE") setOverwrite(res.overwrite)
    if (res?.code !== "EOVERWRITE") setOverwrite("")
    query.refetch()
  }

  return (
    <Box sx={{ display: "flex-row", width: "100%" }}>
      <form onSubmit={(e) => handleSubmit(e)} ref={pageRef}>
        <TextField
          sx={{ marginBottom: "10px" }}
          multiline
          fullWidth
          rows={15}
          name="notes"
          label={`${query.data.node}'s notes`}
          defaultValue={query.data.notes}
          placeholder="Start typing..."
        />
        {overwrite && (
          <TextField
            sx={{ marginBottom: "10px" }}
            multiline
            fullWidth
            rows={5}
            name="old_notes"
            label={`Notes that will be overwritten`}
            color="error"
            value={overwrite}
          />
        )}
        <Button fullWidth variant="outlined" type="submit">
          {loading ? <CircularProgress size={22.75} /> : "Submit"}
        </Button>
      </form>
    </Box>
  )
}

export default Notes
