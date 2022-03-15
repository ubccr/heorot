import { Alert } from "@mui/material"
const ErrorC = ({ message }) => {
  return (
    <Alert variant="outlined" severity="error">
      {message}
    </Alert>
  )
}

export default ErrorC
