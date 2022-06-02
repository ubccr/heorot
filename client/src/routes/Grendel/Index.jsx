import React from "react"
import { useState } from "react"
import { Box, Typography } from "@mui/material"

import BgContainer from "../../components/BgContainer"
import EditNodes from "./EditNodes"
import EditJson from "./EditJson"
import AddNodes from "./AddNodes"

const Index = () => {
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
            width: "300px",
          }}
        >
          Grendel
        </Typography>
      </Box>
      <BgContainer sx={{ alignItems: "Center" }}>
        <EditNodes />
        <EditJson />
        <AddNodes />
      </BgContainer>
    </>
  )
}

export default Index
