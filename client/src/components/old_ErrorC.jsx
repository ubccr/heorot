import { Alert } from "@mui/material"

// TODO: Marked for deprecation
const ErrorC = ({ message }) => {
  return (
    <Alert variant="outlined" severity="error">
      {message}
    </Alert>
  )
}

export default ErrorC
