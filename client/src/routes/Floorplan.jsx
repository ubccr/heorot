import {
  Box,
  Chip,
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
import React, { useContext } from "react"

import BgContainer from "../components/BgContainer"
import Header from "../components/Header"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Floorplan = () => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

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
  return (
    <>
      <Header header="Floor Plan" />
      <BgContainer>
        {query.isFetched && query.data.status === "success" && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="none" />
                  {query.data.floorY.map((col, index) => (
                    <TableCell key={index} align="center" sx={{ padding: "2px" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.floorX.map((row, index) => (
                  <TableRow key={index} align="center">
                    <TableCell align="center" sx={{ padding: "4px" }}>
                      {row}
                    </TableCell>
                    {query.data.floorY.map((col, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{ border: 1, borderColor: "border.main", padding: "2px", width: 70 }}
                      ></TableCell>
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

export default Floorplan
