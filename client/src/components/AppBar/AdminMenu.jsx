import { Button, Menu, MenuItem } from "@mui/material"
import React, { useState } from "react"

import { Link } from "react-router-dom"

const AdminMenu = ({ plugins }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <>
      <Button sx={{ my: 2, color: "white", textTransform: "capitalize" }} onClick={handleOpen}>
        Admin
      </Button>
      <Menu id="admin-menu" anchorEl={anchorEl} open={openMenu} onClose={handleClose}>
        {plugins.status === "success" && plugins.warranty === true && (
          <MenuItem onClick={handleClose} component={Link} to={"/Admin/Warranty"}>
            Warranty
          </MenuItem>
        )}
        <MenuItem onClick={handleClose} component={Link} to={"/Admin/ManageUsers"}>
          Manage Users
        </MenuItem>
        <MenuItem onClick={handleClose} component={Link} to={"/Admin/ManageSwitches"}>
          Manage Switches
        </MenuItem>
      </Menu>
    </>
  )
}

export default AdminMenu
