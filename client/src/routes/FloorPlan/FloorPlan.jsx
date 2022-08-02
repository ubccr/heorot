import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material"
import { useContext, useEffect, useState } from "react"

import { Link } from "react-router-dom"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useSnackbar } from "notistack"

const FloorPlan = () => {
  function createRows(row) {
    let res = []
    row.forEach((el) => {
      res.push({ row: el })
    })
    return res
  }
  function createCols(col) {
    let res = []
    col.forEach((el) => {
      res.push({ col: el })
    })
    return res
  }
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState([])
  const [Nodes, setNodes] = useState()
  const [loading, setLoading] = useState(true)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setRows(createRows(apiConfig.floorplan.floorX))
    setCols(createCols(apiConfig.floorplan.floorY))
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      allowUnauthorized: true,
    }
    const url = `${apiConfig.apiUrl}/grendel/host/list`
    fetch(url, payload)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          setNodes(response.result)
          setLoading(false)
        } else {
          enqueueSnackbar(JSON.stringify(response.result), { variant: "error" })
        }
      })
    return () => {
      setRows([])
      setCols([])
      setNodes()
      setLoading(true)
    }
  }, [])
  return (
    <Box
      sx={{
        padding: "20px",
        border: 1,
        borderRadius: 3,
        borderColor: "primary.main",
        boxShadow: 12,
        bgcolor: "background.main",
        color: "text.primary",
      }}
    >
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 135.5px)" }}>
          {loading && <LinearProgress />}
          {!loading && (
            <Table size="small" style={{ tableLayout: "fixed" }}>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.row}>
                    {cols.map((col) => (
                      <TableCell
                        key={col.col}
                        sx={{
                          textAlign: "center",
                          padding: 0,
                          width: 50,
                          height: 50,
                          border: 1,
                          borderColor: "border.main",
                        }}
                      >
                        {Nodes.find((el) => {
                          let rack = row.row + col.col

                          if (el.name.includes(rack)) return true
                          else return false
                        }) !== undefined && (
                          <Button
                            variant="outlined"
                            sx={{
                              minWidth: 0,
                              width: "100%",
                              height: "100%",
                              padding: 0,
                              textTransform: "lowercase",
                            }}
                            component={Link}
                            to={`/Rack/${row.row + col.col}`}
                          >
                            {row.row + col.col}
                          </Button>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default FloorPlan
