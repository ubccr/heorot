import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"

import BgContainer from "../../components/BgContainer"
import Header from "../../components/Header"
import { PluginContext } from "../../contexts/PluginContext"
import Rack from "./Rack"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Index = () => {
  const [plugins] = useContext(PluginContext)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const [outputType, setOutputType] = useState("rack")
  const [colorType, setColorType] = useState("default")

  useEffect(() => {
    if (localStorage.getItem("floorPlanOutputType") !== null) setOutputType(localStorage.getItem("floorPlanOutputType"))
    if (localStorage.getItem("floorPlanColorType") !== null) setColorType(localStorage.getItem("floorPlanColorType"))

    // return () => {
    //   second
    // }
  }, [user])

  const nodesQuery = useQuery(
    ["floorplanNodes"],
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
  const switchQuery = useQuery(
    ["floorplanSwitches"],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/allSwitches`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  let legendProps = {
    variant: "outlined",
    size: "small",
    sx: {
      marginLeft: "4px",
      marginRight: "4px",
    },
  }

  return (
    <>
      <Header header="Floor Plan" />
      <BgContainer>
        {plugins.status === "success" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                marginBottom: "10px",
              }}
            >
              <ToggleButtonGroup
                color="primary"
                value={outputType}
                exclusive
                onChange={(e, val) => {
                  if (val !== null) {
                    setOutputType(val)
                    localStorage.setItem("floorPlanOutputType", val)
                  }
                }}
                sx={{
                  boxShadow: 2,
                }}
              >
                <ToggleButton value="rack">Rack</ToggleButton>
                <ToggleButton value="switchModel">Switch Model</ToggleButton>
                <ToggleButton value="switchVersion">Switch Version</ToggleButton>
                <ToggleButton value="switchRatio">Switch Ratios</ToggleButton>
                <ToggleButton value="nodeCount">Node Count</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup
                color="primary"
                value={colorType}
                exclusive
                onChange={(e, val) => {
                  if (val !== null) {
                    setColorType(val)
                    localStorage.setItem("floorPlanColorType", val)
                  }
                }}
                sx={{
                  boxShadow: 2,
                }}
              >
                <ToggleButton value="default">Default</ToggleButton>
                <ToggleButton value="colorful">Colorful</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                marginBottom: "10px",
              }}
            >
              {/* TODO: make more inclusive to other naming & datacenter designs */}
              {colorType === "colorful" && outputType === "rack" && (
                <>
                  <Chip label="ubhpc" color="primary" {...legendProps} />
                  <Chip label="faculty" color="success" {...legendProps} />
                  <Chip label="mixed" color="error" {...legendProps} />
                </>
              )}
              {colorType === "colorful" && outputType === "switchModel" && (
                <>
                  <Chip label="No Management Switch" color="primary" {...legendProps} />
                  {/* <Chip label="faculty" color="success" /> */}
                  <Chip label="Management Switch" color="error" {...legendProps} />
                </>
              )}
              {colorType === "colorful" && outputType === "switchVersion" && (
                <>
                  <Chip label="OS 10" color="success" {...legendProps} />
                  <Chip label="OS 9" color="warning" {...legendProps} />
                  <Chip label="OS 8" color="error" {...legendProps} />
                </>
              )}
            </Box>

            {nodesQuery.isFetching && <LinearProgress color="primary" />}
            <Divider sx={{ marginTop: "20px" }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="none" />
                    {plugins.floorplan.floorY.map((val, index) => (
                      <TableCell key={index} align="center" sx={{ padding: "2px" }}>
                        {val}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plugins.floorplan.floorX.map((row, index) => (
                    <TableRow key={index} align="center">
                      <TableCell align="center" sx={{ padding: "4px" }}>
                        {row}
                      </TableCell>
                      {plugins.floorplan.floorY.map((col, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{ border: 1, borderColor: "border.main", padding: "2px", width: 70 }}
                        >
                          <Rack
                            rack={row + col}
                            outputType={outputType}
                            colorType={colorType}
                            nodesQuery={nodesQuery}
                            switchQuery={switchQuery}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </BgContainer>
    </>
  )
}

export default Index
