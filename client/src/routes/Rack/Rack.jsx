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

const Rack = () => {
  const { rack } = useParams()

  const [isRackLoading, setIsRackLoading] = useState(true)
  const [rows, setRows] = useState()

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/rack/${rack}`)
      .then((res) => res.json())
      .then((response) => {
        setRows(
          response.result.map((val, index) => {
            if (val === null) return { u: index.toString(), node: "" }
            else return val
          }),
        )
        setIsRackLoading(false)
      })
  }, [])
  console.log(rows)

  return (
    <Container>
      <Box>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ height: "85vh" }}>
            {isRackLoading && <LinearProgress />}
            {!isRackLoading && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>U</TableCell>
                    <TableCell>{rack}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(0)
                    .reverse()
                    .map((row, index) => (
                      <TableRow key={row.u}>
                        <TableCell>{row.u}</TableCell>
                        {typeof row.node === "object" && (
                          <TableCell>{row.node[0].name}</TableCell>
                        )}
                        {row.node === "" && <TableCell></TableCell>}
                      </TableRow>
                    ))}
                  <TableRow></TableRow>
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  )
}

export default Rack
