import { Grid, TextField } from "@mui/material"
import React, { useState } from "react"

const Notes = () => {
  const [notes, setNotes] = useState("")
  //   TODO: add routes for updating notes section

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
        <TextField
          disabled
          multiline
          fullWidth
          placeholder="Notes: (coming soon)"
          onKeyUp={(e) => setNotes(e.target.value)}
          maxRows={20}
        />
      </Grid>
    </Grid>
  )
}

export default Notes
