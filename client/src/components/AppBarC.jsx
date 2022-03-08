import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import { Toolbar, Button } from "@mui/material"
import Typography from "@mui/material/Typography"
// import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"

import { Link } from "react-router-dom"

const AppBarC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
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

          <Box sx={{ flexGrow: 1 }} />

          <Button sx={{ my: 2, color: "white" }}>
            <Link to={"/Login"}>Login</Link>
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default AppBarC
