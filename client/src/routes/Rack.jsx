import {
  Box,
  Checkbox,
  Grid,
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
import Node from "./Rack/Node"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Rack = () => {
  const { rack } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [user] = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const [colorDisplay, setColorDisplay] = useState("")
  const [textDisplay, setTextDisplay] = useState("name")
  const [tableRef] = useAutoAnimate(null)

  const query = useQuery(
    ["rack", rack],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/rack/${rack}`, payload)).json()
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
              <TableCell align={"center"} width={1}>
                U
              </TableCell>
              <TableCell align={"center"}>{rack}</TableCell>
              <TableCell width={5}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isFetched &&
              query.data.status === "success" &&
              query.data.nodes.map((node, index) => {
                let border_color = "border.main"
                // let background_color = "border.main"

                if (node.height === 1 && node.width === 1) {
                  border_color = "border.table.single"
                  // background_color = "background.table.single"
                } else if (node.height === 1 && node.width >= 2) {
                  border_color = "border.table.quad"
                  // background_color = "background.table.quad"
                } else if (node.height >= 3) {
                } else if (node.height === 2) {
                  border_color = "border.table.double"
                  // background_color = "background.table.double"
                } else if (node.height >= 3) {
                  border_color = "border.table.four"
                  // background_color = "background.table.four"
                }

                return (
                  <TableRow key={index}>
                    {node.type === "rowSpan" && (
                      <>
                        <TableCell align="center" sx={{ padding: 0, height: "80px" }}>
                          {node.u}
                        </TableCell>
                      </>
                    )}
                    {node.type === "node" && node.height > 0 && (
                      <>
                        <TableCell align={"center"} sx={{ padding: 0, height: "80px" }}>
                          {node.u}
                        </TableCell>
                        <TableCell align={"center"} sx={{ padding: 0 }} rowSpan={node.height}>
                          <Grid container sx={{ minHeight: 80 * node.height }}>
                            {node.nodes.map((val, index) => (
                              <Grid
                                item
                                xs={12}
                                md={12 / node.nodes.length}
                                key={index}
                                sx={{
                                  border: 1,
                                  borderWidth: 2,
                                  borderColor: border_color,
                                  padding: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  // backgroundColor: background_color,
                                }}
                              >
                                <Node node={val} />
                              </Grid>
                            ))}
                          </Grid>
                        </TableCell>
                        <TableCell align={"center"} sx={{ padding: 0 }} rowSpan={node.height}>
                          <Checkbox size="small" />
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
