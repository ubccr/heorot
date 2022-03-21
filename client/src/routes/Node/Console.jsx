import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"

import { useState } from "react"

import TerminalC from "./TerminalC"
import NewGridC from "./NewGridC"

const Console = ({ node, BMC }) => {
  const [openDialog, setShowDialog] = useState(false)

  const handleShowConsole = () => {
    setShowDialog(true)
  }
  const handleCloseConsole = () => {
    setShowDialog(false)
  }

  return (
    <>
      <NewGridC heading="BMC Console:">
        <Box sx={{ textAlign: "end" }}>
          <Button variant="outlined" onClick={handleShowConsole}>
            Show Console
          </Button>
        </Box>
      </NewGridC>
      <Dialog open={openDialog} onClose={handleCloseConsole} maxWidth="xl">
        <DialogTitle>{node}'s BMC Console</DialogTitle>
        <DialogContent>
          <TerminalC node={node} BMC={BMC} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseConsole}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Console
