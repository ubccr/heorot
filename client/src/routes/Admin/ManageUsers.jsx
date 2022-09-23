import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { useContext, useState } from "react"

import BgContainer from "../../components/BgContainer"
import Header from "../../components/Header"
import React from "react"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const ManageUsers = () => {
  const [checked, setChecked] = useState([])
  const [action, setAction] = useState("")
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(["users"], async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/auth/users`, payload)).json()
    return res
  })

  const handleChange = (event) => {
    if (event.target.checked === true) setChecked([...checked, event.target.value])
    else if (event.target.checked === false) setChecked(checked.filter((e) => e !== event.target.value))
  }
  const handleUsername = (row) => {
    if (row.username === user.username) return true
    else return false
  }
  const handleSelectChange = (event) => {
    setAction(event.target.value)
  }
  const handleSubmit = () => {
    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        users: checked,
      }),
      //FIXME: allowUnauthorized: true,
    }
    const url = `${apiConfig.apiUrl}/auth/updateUsers`
    fetch(url, payload)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          enqueueSnackbar(JSON.stringify(response.message), {
            variant: "success",
          })
        } else {
          enqueueSnackbar(JSON.stringify(response.message), {
            variant: "error",
          })
        }
      })
    query.refetch()
  }
  return (
    <Box>
      <Header header="Manage Users" />
      <BgContainer>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell>Privileges</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.isFetched &&
                query.data.result.map((row) => (
                  <TableRow key={row.username}>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{row.privileges}</TableCell>
                    <TableCell>
                      <Checkbox onChange={handleChange} value={row.username} disabled={handleUsername(row)} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "inline-flex", marginTop: "20px" }}>
          <FormControl fullWidth sx={{ minWidth: 120, marginRight: "15px" }}>
            <InputLabel id="select-label">Action</InputLabel>
            <Select labelId="select-label" value={action} label="action" onChange={handleSelectChange}>
              <MenuItem value={"null"}>Disable</MenuItem>
              <MenuItem value={"user"}>Set User</MenuItem>
              <MenuItem value={"admin"}>Set Admin</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </BgContainer>
    </Box>
  )
}

export default ManageUsers
