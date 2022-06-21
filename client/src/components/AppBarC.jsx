import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import {
  Toolbar,
  Button,
  Switch,
  MenuItem,
  Menu,
  Typography,
  InputBase,
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import MenuIcon from "@mui/icons-material/Menu"

import { useSnackbar } from "notistack"
import { Link } from "react-router-dom"
import { ThemeContext } from "../contexts/ThemeContext"
import { UserContext } from "../contexts/UserContext"
import { useContext, useState } from "react"
import AdminMenu from "./AppBar/AdminMenu"
import { apiConfig } from "../config"
import SearchC from "./AppBar/SearchC"
import MainMenuC from "./AppBar/MainMenuC"
import { useQuery } from "react-query"

const AppBarC = () => {
  const { enqueueSnackbar } = useSnackbar()

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
          "x-access-token": userD.accessToken,
        },
        body: JSON.stringify({
          theme: newMode,
        }),
      }
      fetch(`${apiConfig.apiUrl}/auth/setTheme`, payload)
    }
  }

  const query = useQuery(
    "plugins",
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/plugins`, payload)
      ).json()
      return res
    },
    { retry: 2 }
  )

  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)
  const handleAccountOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const handleSignout = () => {
    setAnchorEl(null)
    setUser(null)
    setMode("light")
    localStorage.clear("user")
    enqueueSnackbar("Successfully logged out", { variant: "success" })
  }
  const menuId = "primary-search-account-menu"

  return (
    <Box>
      <AppBar position="static" id="nav">
        <Toolbar>
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

          <MainMenuC user={user} query={query} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              sx={{ my: 2, color: "white", textTransform: "capitalize" }}
              component={Link}
              to={"/"}
            >
              Home
            </Button>
            <Button
              sx={{ my: 2, color: "white", textTransform: "capitalize" }}
              component={Link}
              to={"/FloorPlan"}
            >
              Floor Plan
            </Button>
            {query.isFetched && !query.isError && query.data.ome === true && (
              <Button
                sx={{ my: 2, color: "white", textTransform: "capitalize" }}
                component={Link}
                to={"/Alerts"}
              >
                Alerts
              </Button>
            )}
            <Button
              sx={{ my: 2, color: "white", textTransform: "capitalize" }}
              component={Link}
              to={"/Grendel"}
            >
              Grendel
            </Button>
            {user !== null && user.privileges === "admin" && (
              <AdminMenu query={query} />
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user !== null && <SearchC />}

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
        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to={"/Profile"}
          disabled
        >
          Profile
        </MenuItem>
        <MenuItem onClick={handleSignout}>Sign out</MenuItem>
      </Menu>
    </Box>
  )
}

export default AppBarC
