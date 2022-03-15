import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Container,
  Paper,
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

const Rack = () => {
  const { rack } = useParams()

  const [isRackLoading, setIsRackLoading] = useState(true)
  const [rows, setRows] = useState()

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/rack/${rack}`)
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