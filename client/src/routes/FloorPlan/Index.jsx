import { LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
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
  const [outputType, setOutputType] = useState("switchModel")

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
        {nodesQuery.isFetching && <LinearProgress color="primary" />}
        {plugins.status === "success" && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  {plugins.floorplan.floorY.map((val, index) => (
                    <TableCell key={index} align="center">
                      {val}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins.floorplan.floorX.map((row, index) => (
                  <TableRow key={index} align="center">
                    <TableCell align="center">{row}</TableCell>
                    {plugins.floorplan.floorY.map((col, index) => (
                      <TableCell key={index} align="center" sx={{ border: 1, borderColor: "border.main" }}>
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
        )}
      </BgContainer>
    </>
  )
}

export default Index
