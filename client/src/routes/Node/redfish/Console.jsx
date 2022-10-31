import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"

import NewGridC from "../components/NewGridC"
import ResetNode from "../components/ResetNode"
import TerminalC from "./TerminalC"
import { useState } from "react"

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
          <ResetNode node={node} />
          <Button variant="outlined" onClick={handleCloseConsole}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Console
