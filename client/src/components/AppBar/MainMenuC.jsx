import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import { Menu, MenuItem } from "@mui/material"
import { Link } from "react-router-dom"
import { useState } from "react"

const MainMenuC = ({ user }) => {
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
        <MenuItem component={Link} to={"/Alerts"}>
          Alerts
        </MenuItem>
        {user !== null && user.privileges === "admin" && (
          <MenuItem component={Link} to={"/Admin/Warranty"}>
            Warranty
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default MainMenuC
