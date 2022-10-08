import { Box, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import BgContainer from "../../components/BgContainer.jsx"
import Body from "./Body.jsx"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useParams } from "react-router-dom"

const Rack = () => {
  const [tableRef] = useAutoAnimate(null)
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
    <BgContainer>
      <TableContainer ref={tableRef}>
        {isRackLoading && <LinearProgress />}
        {!isRackLoading && (
          <Table sx={{ tableLayout: "fixed" }}>
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
    </BgContainer>
  )
}

export default Rack
