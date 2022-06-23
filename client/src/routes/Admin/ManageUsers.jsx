import {
  Box,
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import React from "react"
import BgContainer from "../../components/BgContainer"
import Header from "../../components/Header"
import UserSelect from "./components/UserSelect"
import { useState } from "react"

const ManageUsers = () => {
  let rows = [
    { username: "Test", dateAdded: "2020" },
    { username: "Test2", dateAdded: "2022" },
  ]
  const [checked, setChecked] = useState(new Array(rows.length).fill(false))
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
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.dateAdded}</TableCell>
                  <TableCell>
                    <Checkbox />
                    {/* <UserSelect /> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </BgContainer>
    </Box>
  )
}

export default ManageUsers
