import { Menu, MenuItem } from "@mui/material"

import IconButton from "@mui/material/IconButton"
import { Link } from "react-router-dom"
import MenuIcon from "@mui/icons-material/Menu"
import { useState } from "react"

const MainMenuC = ({ user, plugins }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        sx={{ display: { sx: "flex", md: "none" } }}
        onClick={handleMenuOpen}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} to={"/"}>
          Home
        </MenuItem>
        <MenuItem component={Link} to={"/FloorPlan"}>
          Floor Plan
        </MenuItem>
        {plugins.status === "success" && plugins.ome === true && (
          <MenuItem component={Link} to={"/Alerts"}>
            Alerts
          </MenuItem>
        )}
        <MenuItem component={Link} to={"/Grendel"}>
          Grendel
        </MenuItem>
        {user !== null && user.privileges === "admin" && plugins.status === "success" && plugins.warranty === true && (
          <MenuItem component={Link} to={"/Admin/Warranty"}>
            Warranty
          </MenuItem>
        )}
        <MenuItem component={Link} to={"/Admin/ManageUsers"}>
          Manage Users
        </MenuItem>
        <MenuItem component={Link} to={"/Admin/ManageSwitches"}>
          Manage Switches
        </MenuItem>
      </Menu>
    </>
  )
}

export default MainMenuC
