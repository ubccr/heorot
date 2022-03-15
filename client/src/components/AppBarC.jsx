import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import {
  Toolbar,
  Button,
  Switch,
  MenuItem,
  Menu,
  Typography,
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"

import { Link } from "react-router-dom"
import { ThemeContext } from "../contexts/ThemeContext"
import { UserContext } from "../contexts/UserContext"
import { useContext, useEffect, useState } from "react"

const AppBarC = () => {
  const [user, setUser] = useContext(UserContext)
  // Theme switching
  const [mode, setMode] = useContext(ThemeContext)
  const modeToggle = (e) => {
    let newMode = "light"
    if (mode === "light") newMode = "dark"
    else newMode = "light"

    setMode(newMode)
    let userD = JSON.parse(localStorage.getItem("user"))
    if (userD !== null) {
      userD.theme = newMode
      localStorage.setItem("user", JSON.stringify(userD))
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "x-access-token": userD.accessToken,
          theme: newMode,
        }),
      }
      fetch(`http://${window.location.hostname}:3030/auth/setTheme`, payload)
    }
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)
  const handleAccountOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const menuId = "primary-search-account-menu"

  return (
    <Box>
      <AppBar position="static" id="nav">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <Box
              sx={{
                bgcolor: "background.main",
                padding: "4px",
                borderRadius: "5px",
                border: 1,
                borderColor: "primary.main",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src="./favicon.ico" width="30" height="30" alt="" />
            </Box>
          </Typography>
          <Button sx={{ my: 2, color: "white" }}>
            <Link to={"/"}>Home </Link>
          </Button>
          <Button sx={{ my: 2, color: "white" }}>
            <Link to={"/FloorPlan"}>Floor Plan</Link>
          </Button>

          <Box sx={{ flexGrow: 1 }} />
          <Switch color="default" size="small" onChange={modeToggle} />
          {user === null && (
            <Button sx={{ my: 2, color: "white" }}>
              <Link to={"/Login"}>Login</Link>
            </Button>
          )}
          {user !== null && (
            <IconButton size="large" onClick={handleAccountOpen}>
              <AccountCircleOutlinedIcon sx={{ color: "white" }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Link to="/Profile">Profile</Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link to="/Signout">Sign out</Link>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AppBarC
