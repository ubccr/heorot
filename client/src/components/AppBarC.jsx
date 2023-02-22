import { Button, Toolbar, Typography } from "@mui/material"

import AccountMenu from "./AppBar/AccountMenu"
import AdminMenu from "./AppBar/AdminMenu"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined"
import IconButton from "@mui/material/IconButton"
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined"
import { Link } from "react-router-dom"
import MainMenuC from "./AppBar/MainMenuC"
import { PluginContext } from "../contexts/PluginContext"
import SearchC from "./AppBar/SearchC"
import { ThemeContext } from "../contexts/ThemeContext"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useContext } from "react"

const AppBarC = () => {
  const [user, setUser] = useContext(UserContext)
  const [mode, setMode] = useContext(ThemeContext)
  const [plugins] = useContext(PluginContext)
  const [modeRef] = useAutoAnimate(null)

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

  return (
    <Box>
      <AppBar position="static" id="nav">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 2, display: { xs: "none", md: "flex" } }}>
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

          <MainMenuC user={user} plugins={plugins} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button sx={{ my: 2, color: "white", textTransform: "capitalize" }} component={Link} to={"/"}>
              Home
            </Button>
            <Button sx={{ my: 2, color: "white", textTransform: "capitalize" }} component={Link} to={"/FloorPlan"}>
              Floor Plan
            </Button>
            {plugins.status === "success" && plugins.ome === true && (
              <Button sx={{ my: 2, color: "white", textTransform: "capitalize" }} component={Link} to={"/Alerts"}>
                Alerts
              </Button>
            )}
            <Button sx={{ my: 2, color: "white", textTransform: "capitalize" }} component={Link} to={"/Grendel"}>
              Grendel
            </Button>
            {user !== null && user.privileges === "admin" && <AdminMenu plugins={plugins} />}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user !== null && <SearchC />}

          <IconButton ref={modeRef} onClick={() => modeToggle()}>
            {mode === "light" && <DarkModeOutlinedIcon sx={{ color: "white" }} />}
            {mode === "dark" && <LightModeOutlinedIcon sx={{ color: "white" }} />}
          </IconButton>
          {user === null && (
            <Button sx={{ my: 2, color: "white" }}>
              <Link to={"/Login"}>Login</Link>
            </Button>
          )}
          {user !== null && <AccountMenu />}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default AppBarC
