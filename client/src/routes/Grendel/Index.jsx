import { Box, Divider, Tab, Tabs, Typography } from "@mui/material"

import AddNode from "./AddNode"
import BgContainer from "../../components/BgContainer"
import EditJson from "./EditJson"
import EditNodes from "./EditNodes"
import ImportNodes from "./ImportNodes"
import { useState } from "react"

const Index = () => {
  const [value, setValue] = useState(0)
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Tabs
            value={value}
            onChange={(e, newVal) => setValue(newVal)}
            sx={{ border: 1, borderColor: "border.main", borderRadius: 2, boxShadow: 2 }}
          >
            <Tab label="Add Node" />
            <Tab label="Edit Nodes" />
            <Tab label="Bulk Import Nodes" />
          </Tabs>
        </Box>
        <Divider sx={{ marginBottom: "15px" }} />
        {value === 0 && <AddNode />}

        {value === 1 && (
          <>
            <EditNodes />
            <EditJson />
          </>
        )}
        {value === 2 && <ImportNodes />}
      </BgContainer>
    </>
  )
}

export default Index
