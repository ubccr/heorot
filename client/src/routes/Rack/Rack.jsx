import { useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { UserContext } from "../../contexts/UserContext"

import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
} from "@mui/material"

import Body from "./Body.jsx"
import { apiConfig } from "../../config"

const Rack = () => {
  const { rack } = useParams()
  const [user, setUser] = useContext(UserContext)

  const [isRackLoading, setIsRackLoading] = useState(true)
  const [rows, setRows] = useState()

  useEffect(() => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(`${apiConfig.apiUrl}/client/rack/${rack}`, payload)
      .then((res) => res.json())
      .then((response) => {
        setRows(response.result.nodes)
        setIsRackLoading(false)
      })
  }, [])

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "primary.main",
        boxShadow: 12,
        bgcolor: "background.main",
        color: "text.primary",
      }}
    >
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 95.5px)",
          overflowX: "hidden",
        }}
      >
        {isRackLoading && <LinearProgress />}
        {!isRackLoading && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align={"center"} width={40}>
                  U
                </TableCell>
                <TableCell align={"center"}>{rack}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Body array={rows} />
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  )
}

export default Rack
