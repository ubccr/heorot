import { Alert, Snackbar } from "@mui/material"

// import { useState } from "react"
// const [openAlert, setOpenAlert] = useState(false)

const AlertC = ({ color, message, openAlert, setOpenAlert }) => {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setOpenAlert(false)
  }
  return (
    <Snackbar open={openAlert} autoHideDuration={4000} onClose={handleClose}>
      <Alert severity={color} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default AlertC
