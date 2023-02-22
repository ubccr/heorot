import { IconButton, Menu, MenuItem } from "@mui/material"
import { useContext, useState } from "react"

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import { Link } from "react-router-dom"
import { ThemeContext } from "../../contexts/ThemeContext"
import { UserContext } from "../../contexts/UserContext"
import { useSnackbar } from "notistack"

const AccountMenu = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [anchorEl, setAnchorEl] = useState(null)
  const [user, setUser] = useContext(UserContext)
  const [mode, setMode] = useContext(ThemeContext)

  const openMenu = Boolean(anchorEl)
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleSignOut = () => {
    setAnchorEl(null)
    setUser(null)
    setMode("light")
    localStorage.clear("user")
    enqueueSnackbar("Successfully logged out", { variant: "success" })
  }
  return (
    <>
      <IconButton onClick={handleOpen}>
        <AccountCircleOutlinedIcon sx={{ color: "white" }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id="account-menu"
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={openMenu}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose} component={Link} to={"/Profile"}>
          Profile
        </MenuItem>
        {user.privileges === "admin" && (
          <MenuItem onClick={handleClose} component={Link} to={"/Settings"}>
            Settings
          </MenuItem>
        )}
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </>
  )
}

export default AccountMenu
