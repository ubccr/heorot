import { Button, Menu, MenuItem } from "@mui/material"
import React, { useState } from "react"
import { Link } from "react-router-dom"

const AdminMenu = ({ query }) => {
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
      <Button
        sx={{ my: 2, color: "white", textTransform: "capitalize" }}
        onClick={handleOpen}
      >
        Admin
      </Button>
      <Menu
        id="admin-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
      >
        {query.isFetched && !query.isError && query.data.warranty === true && (
          <MenuItem
            onClick={handleClose}
            component={Link}
            to={"/Admin/Warranty"}
          >
            Warranty
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default AdminMenu
