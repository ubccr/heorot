import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import { Toolbar, Button, Switch } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"

import { Link } from "react-router-dom"
import { ThemeContext } from "../contexts/ThemeContext"
import { useContext } from "react"

const AppBarC = () => {
  const [mode, setMode] = useContext(ThemeContext)
  const modeToggle = (e) => {
    let newMode = "light"
    if (mode === "light") newMode = "dark"
    else newMode = "light"

    setMode(newMode)
    let user = JSON.parse(localStorage.getItem("user"))
    if (user !== null) {
      user.theme = newMode
      localStorage.setItem("user", JSON.stringify(user))
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "x-access-token": user.accessToken,
          theme: newMode,
        }),
      }
      fetch(`http://${window.location.hostname}:3030/auth/setTheme`, payload)
    }
  }
  return (
    <AppBar position="static" id="nav">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Button sx={{ my: 2, color: "white" }}>
          <Link to={"/"}>Home </Link>
        </Button>
        <Button sx={{ my: 2, color: "white" }}>
          <Link to={"/Profile"}>Profile</Link>
        </Button>
        <Button sx={{ my: 2, color: "white" }}>
          <Link to={"/FloorPlan"}>Floor Plan</Link>
        </Button>

        <Box sx={{ flexGrow: 1 }} />
        <Switch color="default" size="small" onChange={modeToggle} />
        <Button sx={{ my: 2, color: "white" }}>
          <Link to={"/Login"}>Login</Link>
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarC
