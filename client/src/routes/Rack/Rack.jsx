import { Box, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import Body from "./Body.jsx"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useParams } from "react-router-dom"

const Rack = () => {
  const { rack } = useParams()
  const [user] = useContext(UserContext)

  const [isRackLoading, setIsRackLoading] = useState(true)
  const [rows, setRows] = useState()

  useEffect(() => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(`${apiConfig.apiUrl}/client/rack/${rack}`, payload)
      .then((res) => res.json())
      .then((response) => {
        setRows(response.result.nodes)
        setIsRackLoading(false)
      })
  }, [rack])

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "primary.main",
        boxShadow: 12,
        bgcolor: "background.main",
        color: "text.primary",
      }}
    >
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 95.5px)",
          // overflowX: "hidden",
        }}
      >
        {isRackLoading && <LinearProgress />}
        {!isRackLoading && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align={"center"} width={40}>
                  U
                </TableCell>
                <TableCell align={"center"}>{rack}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Body array={rows} />
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  )
}

export default Rack
