import { Grid, Typography } from "@mui/material"

import React from "react"

const NewGridC = ({ heading, children }) => {
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
        height: "auto",
        minHeight: 60,
      }}
    >
      <Grid item xs={2}>
        <Typography variant="h2" sx={{ fontSize: "18pt", paddingLeft: 2 }}>
          {heading}
        </Typography>
      </Grid>
      {children && (
        <Grid item xs={10}>
          {children}
        </Grid>
      )}
    </Grid>
  )
}

export default NewGridC
