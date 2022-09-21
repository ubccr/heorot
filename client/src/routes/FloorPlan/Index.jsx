import {
  Box,
  Divider,
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
import React, { useContext, useState } from "react"

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
                  if (val !== null) setOutputType(val)
                }}
                sx={{
                  boxShadow: 2,
                }}
              >
                <ToggleButton value="rack">Rack</ToggleButton>
                <ToggleButton value="switchModel">Switch Model</ToggleButton>
                <ToggleButton value="switchVersion">Switch Version</ToggleButton>
                <ToggleButton value="switchRatio">Switch Ratios</ToggleButton>
              </ToggleButtonGroup>
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
