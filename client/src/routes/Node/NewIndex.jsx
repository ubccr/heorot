import { Box, Tab, Tabs } from "@mui/material"

import React from "react"
import { useState } from "react"

const NewIndex = () => {
  const [tab, setTab] = useState("Grendel")
  return (
    <Box>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Grendel" />
        <Tab label="Console" />
        <Tab label="Redfish" />
      </Tabs>
    </Box>
  )
}

export default NewIndex
