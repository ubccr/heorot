import { Box, Typography } from "@mui/material"

import AddNodes from "./AddNodes"
import BgContainer from "../../components/BgContainer"
import EditJson from "./EditJson"
import EditNodes from "./EditNodes"
import General from "./General"
import React from "react"

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
        {/* <General /> */}
        <EditNodes />
        <EditJson />
        <AddNodes />
      </BgContainer>
    </>
  )
}

export default Index
