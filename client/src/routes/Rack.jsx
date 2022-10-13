import {
  Checkbox,
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
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Rack = () => {
  const { rack } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [user] = useContext(UserContext)

  const query = useQuery(
    ["rack", rack],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/Rack/${rack}`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  return (
    <BgContainer>
      <TableContainer>
        {/* {isRackLoading && <LinearProgress />} */}
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell align={"center"} width={40}>
                U
              </TableCell>
              <TableCell align={"center"}>{rack}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.isFetched &&
              query.data.status === "success" &&
              query.data.result.nodes
                .map((val, index) => (
                  <TableRow key={index}>
                    <TableCell>{val.u}</TableCell>
                    <TableCell>{val.node}</TableCell>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                  </TableRow>
                ))
                .reverse()}
          </TableBody>
        </Table>
      </TableContainer>
    </BgContainer>
  )
}

export default Rack
