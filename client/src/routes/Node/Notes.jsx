import { Box, Button, CircularProgress, TextField } from "@mui/material"
import React, { useContext, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useSnackbar } from "notistack"

const Notes = ({ query }) => {
  const { enqueueSnackbar } = useSnackbar()

  const [user] = useContext(UserContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ node: query.data.node, notes: e.currentTarget.notes.value }),
    }
    let res = await (await fetch(`${apiConfig.apiUrl}/client/v1/notes`, payload)).json()
    setLoading(false)
    if (res.status === "success") enqueueSnackbar(`Successfully updated notes`, { variant: res.status })
    else enqueueSnackbar(res.message, { variant: res.status })
    query.refetch()
  }

  return (
    <Box sx={{ display: "flex-row", width: "100%" }}>
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextField
          multiline
          fullWidth
          rows={15}
          name="notes"
          label={`${query.data.node}'s notes`}
          defaultValue={query.data.notes}
          placeholder="Start typing..."
        />
        <Button fullWidth variant="outlined" type="submit" sx={{ marginTop: "10px" }}>
          {loading ? <CircularProgress size={22.75} /> : "Submit"}
        </Button>
      </form>
    </Box>
  )
}

export default Notes
