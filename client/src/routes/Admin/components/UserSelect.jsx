import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { Box } from "@mui/system"
import React from "react"
import { useState } from "react"

const UserSelect = () => {
  const [action, setAction] = useState("")

  const handleChange = (event) => {
    setAction(event.target.value)
  }
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="select-label">Action</InputLabel>
        <Select
          labelId="select-label"
          value={action}
          label="action"
          onChange={handleChange}
        >
          <MenuItem value={"null"}>Disable</MenuItem>
          <MenuItem value={"user"}>Set User</MenuItem>
          <MenuItem value={"admin"}>Set Admin</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default UserSelect
