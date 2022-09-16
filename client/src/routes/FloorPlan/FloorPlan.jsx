import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Paper,
  Switch,
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
import { useQuery } from "react-query"
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
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setRows(createRows(apiConfig.floorplan.floorX))
    setCols(createCols(apiConfig.floorplan.floorY))
    return () => {
      setRows([])
      setCols([])
    }
  }, [])

  const nodesQuery = useQuery(
    ["nodes"],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/host/list`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  const [showRatios, setShowRatios] = useState(false)
  const switchesQuery = useQuery("switches", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/switches/allData`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
    return res
  })

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
          {switchesQuery.isFetched && switchesQuery.data.status === "success" && (
            <FormGroup>
              <FormControlLabel
                control={<Switch onChange={() => setShowRatios(!showRatios)} />}
                label="Show oversub ratios"
              />
            </FormGroup>
          )}
          {!nodesQuery.isFetched && <LinearProgress />}
          {nodesQuery.isFetched && nodesQuery.data.status === "success" && (
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
                        {nodesQuery.data.result.find((el) => {
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
                            <br />
                            {showRatios === true &&
                              switchesQuery.isFetched &&
                              switchesQuery.data.status === "success" &&
                              switchesQuery.data.result.map((val) => {
                                let rack = row.row + col.col
                                if (val.rack === rack) {
                                  return val.ratio
                                }
                              })}
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
