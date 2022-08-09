import { Box, Button, Typography } from "@mui/material"

import Status from "../../components/Status"
import { useState } from "react"

const General = () => {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ marginBottom: "10px" }}>
      <Typography variant="h2" sx={{ fontSize: "16pt" }}>
        General:
      </Typography>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        Status
      </Button>
      <Status open={open} setOpen={setOpen} />
    </Box>
  )
}

export default General
