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
    if (mode === "light") setMode("dark")
    else setMode("light")
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
