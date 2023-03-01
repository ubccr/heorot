import {
  Box,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import React, { useContext, useState } from "react"

import BgContainer from "../components/BgContainer"
import CellRack from "./FloorPlan/CellRack"
import Header from "../components/Header"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

// TODO: think about different display options
// TODO: deprecate management switch display?

const Floorplan = () => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()
  const [chipRef] = useAutoAnimate(null)
  const [tableRef] = useAutoAnimate(null)
  const [outputType, setOutputType] = useState(
    localStorage.getItem("floorPlanOutputType") !== null ? localStorage.getItem("floorPlanOutputType") : "rack"
  )
  const [color, setColor] = useState(
    localStorage.getItem("floorPlanColor") !== null ? localStorage.getItem("floorPlanColor") === "true" : false
  )

  const query = useQuery(
    ["floorplan"],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/floorplan`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  let legendProps = {
    variant: "outlined",
    sx: { margin: "4px" },
  }
  return (
    <>
      <Header header="Floor Plan" />
      <BgContainer>
        <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
          <Grid item xs={12} md={7} textAlign="center" ref={chipRef}>
            {/* Rack */}
            {query.isFetched &&
              outputType === "rack" &&
              color === true &&
              query.data.config.tag_mapping.map((val, index) => (
                <Chip key={index} label={val.tag} color={val.color} {...legendProps} />
              ))}
            {query.isFetched && outputType === "rack" && color === true && (
              <Chip
                label={query.data.config.tag_multiple.tag}
                color={query.data.config.tag_multiple.color}
                {...legendProps}
              />
            )}

            {/* Model */}
            {query.isFetched &&
              outputType === "sw_model" &&
              color === true &&
              query.data.config.model_color.map((val, index) => (
                <Chip key={index} label={val.display} color={val.color} {...legendProps} />
              ))}

            {/* Version */}
            {query.isFetched &&
              outputType === "sw_version" &&
              color === true &&
              query.data.config.version_color.map((val, index) => (
                <Chip key={index} label={val.display} color={val.color} {...legendProps} />
              ))}
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Display</InputLabel>
              <Select
                value={outputType}
                label="Display"
                onChange={(e) => {
                  setOutputType(e.target.value)
                  localStorage.setItem("floorPlanOutputType", e.target.value)
                }}
              >
                <MenuItem value={"rack"}>Rack</MenuItem>
                <MenuItem value={"sw_model"}>Switch Model</MenuItem>
                <MenuItem value={"sw_version"}>Switch Version</MenuItem>
                <MenuItem value={"sw_ratio"}>Switch Ratio</MenuItem>
                <MenuItem value={"node_count"}>Node Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2} textAlign="center">
            <FormControlLabel
              control={
                <Switch
                  checked={color}
                  onChange={(e, val) => {
                    setColor(val)
                    localStorage.setItem("floorPlanColor", val)
                  }}
                />
              }
              label="Color"
            />
          </Grid>
        </Grid>
        <Divider />
        <Box ref={tableRef}>
          {query.isFetching && <LinearProgress />}

          <TableContainer>
            {query.isFetched && query.data.status === "success" && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="none" />
                    {query.data.config.floorY.map((col, index) => (
                      <TableCell key={index} align="center" sx={{ padding: "2px" }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {query.data.config.floorX.map((row, index) => (
                    <TableRow key={index} align="center">
                      <TableCell align="center" sx={{ padding: "4px" }}>
                        {row}
                      </TableCell>
                      {query.data.config.floorY.map((col, index) => {
                        let rack = query.data.result.find((val) => val.rack === row + col)
                        return (
                          <TableCell
                            key={index}
                            align="center"
                            sx={{ border: 1, borderColor: "border.main", padding: "2px", width: 70 }}
                          >
                            {rack.u_count > 0 && <CellRack rack={rack} outputType={outputType} color={color} />}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </BgContainer>
    </>
  )
}

export default Floorplan
