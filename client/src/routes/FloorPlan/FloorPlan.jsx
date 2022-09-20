import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"

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
  const [showSwInfo, setShowSwInfo] = useState(false)

  const switchesQuery = useQuery("switches", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/allSwitches`, payload)).json()
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
            <FormGroup sx={{ marginLeft: "10px" }}>
              <FormControlLabel
                control={<Switch onChange={() => setShowRatios(!showRatios)} />}
                label="Show oversub ratios"
              />
              <FormControlLabel
                control={<Switch onChange={() => setShowSwInfo(!showSwInfo)} />}
                label="Show switch model"
              />
            </FormGroup>
          )}
          {!nodesQuery.isFetched && <LinearProgress />}
          {nodesQuery.isFetched && nodesQuery.data.status === "success" && (
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {cols.map((cols, index) => (
                    <TableCell key={index} align="center">
                      {cols.col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell align="center">{row.row}</TableCell>
                    {cols.map((col) => (
                      <TableCell
                        key={col.col}
                        sx={{
                          textAlign: "center",
                          padding: 0,
                          minWidth: 80,
                          minHeight: 80,
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
                              // minWidth: 0,
                              width: "100%",
                              height: "100%",
                              padding: 1,
                              textTransform: "lowercase",
                            }}
                            component={Link}
                            to={`/Rack/${row.row + col.col}`}
                          >
                            <Typography>
                              {row.row + col.col}
                              {showRatios === true &&
                                switchesQuery.isFetched &&
                                switchesQuery.data.status === "success" &&
                                switchesQuery.data.result.map((val, index) => {
                                  if (
                                    val.node.split("-")[1] === row.row + col.col &&
                                    val.info.status === "success" &&
                                    val.info.activeOversubscription > 0
                                  ) {
                                    return (
                                      <React.Fragment key={index}>
                                        <Divider />
                                        {val.info.activeOversubscription}
                                      </React.Fragment>
                                    )
                                  }
                                })}
                              {showSwInfo === true &&
                                switchesQuery.isFetched &&
                                switchesQuery.data.status === "success" &&
                                switchesQuery.data.result.map((val, index) => {
                                  if (val.node.split("-")[1] === row.row + col.col && val.info.status === "success") {
                                    let output = !val.result.output.model.match("^PowerConnect")
                                      ? val.result.output.model
                                      : `PC ${val.result.output.model.substring(12)}`
                                    return (
                                      <React.Fragment key={index}>
                                        <Divider />
                                        {output}
                                      </React.Fragment>
                                    )
                                  }
                                })}
                            </Typography>
                          </Button>
                        )}
                        {nodesQuery.data.result.find((el) => {
                          let rack = row.row + col.col

                          if (el.name.includes(rack)) return true
                          else return false
                        }) === undefined && <div />}
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
