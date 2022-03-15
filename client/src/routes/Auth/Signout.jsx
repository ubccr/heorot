import { Container, Typography } from "@mui/material"
import { useContext, useEffect } from "react"
import { UserContext } from "../../contexts/UserContext"
import { ThemeContext } from "../../contexts/ThemeContext"

const Signout = () => {
  const [user, setUser] = useContext(UserContext)
  const [mode, setMode] = useContext(ThemeContext)

  useEffect(() => {
    setUser(null)
    setMode("light")
    localStorage.clear("user")
  }, [user, mode])
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
      <Typography
        sx={{
          padding: "30px",
          fontSize: 36,
          fontWeight: "light",
          letterSpacing: 1,
        }}
      >
        Successfully signed out
      </Typography>
    </Container>
  )
}

export default Signout
