import { Container, Typography } from "@mui/material"
import { useContext } from "react"
import { UserContext } from "../../contexts/UserContext"

const Signout = () => {
  const [user, setUser] = useContext(UserContext)
  setUser(null)
  localStorage.clear("user")
  return (
    <Container
      sx={{
        textAlign: "center",
        border: 1,
        borderRadius: 3,
        borderColor: "primary.main",
        bgcolor: "background.main",
        boxShadow: 12,
      }}
    >
      <Typography sx={{ fontSize: 36, fontWeight: "light", letterSpacing: 1 }}>
        Successfully signed out
      </Typography>
      {/* <Divider /> */}
    </Container>
  )
}

export default Signout
