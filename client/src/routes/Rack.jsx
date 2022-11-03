import {
  Button,
  Checkbox,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import React, { useContext, useState } from "react"

import BgContainer from "../components/BgContainer"
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { PluginContext } from "../contexts/PluginContext"
import RenderNode from "./Rack/RenderNode"
import SwitchGen from "./Rack/components/SwitchGen"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Rack = () => {
  const { rack } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [user] = useContext(UserContext)
  const [tableRef] = useAutoAnimate(null)
  const [refreshCache, setRefreshCache] = useState("false")
  const [plugins] = useContext(PluginContext)
  let navigate = useNavigate()

  let leftRack = () => {
    let row = rack.slice(0, 1)
    let col = rack.slice(1)
    let floorY = plugins.floorplan.floorY
    let leftRack = floorY[floorY.indexOf(col) - 1]
    navigate(`/Rack/${row + leftRack}`)
  }
  let rightRack = () => {
    let row = rack.slice(0, 1)
    let col = rack.slice(1)
    let floorY = plugins.floorplan.floorY
    let rightRack = floorY[floorY.indexOf(col) + 1]
    navigate(`/Rack/${row + rightRack}`)
  }

  const refetchQuery = () => {
    setRefreshCache("true")
    query.refetch()
  }

  const query = useQuery(
    ["rack", rack, refreshCache],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/rack/${rack}/${refreshCache}`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  return (
    <BgContainer>
      <TableContainer ref={tableRef}>
        {query.isFetching && <LinearProgress />}
        <Table sx={{ tableLayout: "fixed" }} size="small">
          <TableHead>
            <TableRow>
              <TableCell align={"center"} width={40} sx={{ padding: 0 }}>
                <IconButton variant="outlined" onClick={() => leftRack()} sx={{ float: "left" }}>
                  <ChevronLeftIcon />
                </IconButton>
              </TableCell>
              <TableCell align={"center"}>
                <Grid container>
                  <Grid item xs={4}>
                    <IconButton onClick={() => refetchQuery()} size="small" sx={{ float: "left" }}>
                      <CachedOutlinedIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    {rack}
                  </Grid>
                  <Grid item xs={4}>
                    <Button disabled variant="outlined" size="small">
                      Actions
                    </Button>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell width={40} sx={{ padding: 0 }}>
                <IconButton variant="outlined" onClick={() => rightRack()} sx={{ float: "right" }}>
                  <ChevronRightIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isFetched &&
              query.data.status === "success" &&
              query.data.nodes.map((node, index) => {
                let border_color = "border.main"

                if (node.height === 1 && node.width === 1) border_color = "border.table.single"
                else if (node.height === 1 && node.width >= 2) border_color = "border.table.quad"
                else if (node.height >= 3) border_color = "border.table.four"
                else if (node.height === 2) border_color = "border.table.double"
                else if (node.height >= 3) border_color = "border.table.four"

                return (
                  <TableRow key={index}>
                    {node.type === "rowSpan" && (
                      <TableCell align="center" sx={{ padding: 0, height: "80px" }}>
                        {node.u}
                      </TableCell>
                    )}
                    {(node.type === "node" || node.type === "switch") && node.height > 0 && (
                      <>
                        <TableCell align={"center"} sx={{ padding: 0, height: "80px" }}>
                          {node.u}
                        </TableCell>
                        <TableCell align={"center"} sx={{ padding: 0 }} rowSpan={node.height}>
                          <Grid container sx={{ minHeight: 80 * node.height }}>
                            {node.type === "node" &&
                              node.nodes.map((val, index) => (
                                <Grid
                                  item
                                  xs={12}
                                  md={12 / node.width}
                                  key={index}
                                  sx={{
                                    border: 1,
                                    borderWidth: 2,
                                    borderColor: border_color,
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <RenderNode node={val} />
                                </Grid>
                              ))}
                            {node.type === "switch" && <SwitchGen data={node} />}
                          </Grid>
                        </TableCell>
                        <TableCell align={"center"} sx={{ padding: 0 }} rowSpan={node.height}>
                          {node.nodes.map((val, index) => (
                            <Checkbox size="small" key={index} disabled />
                          ))}
                        </TableCell>
                      </>
                    )}
                    {node.type === "" && (
                      <>
                        <TableCell align={"center"} sx={{ padding: 0, height: "80px" }}>
                          {node.u}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </BgContainer>
  )
}

export default Rack
