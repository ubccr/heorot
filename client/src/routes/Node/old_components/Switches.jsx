import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Switches = ({ node }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["switch", node],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/query/${node}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  return (
    <Box
      sx={{
        overflow: "hidden",
        padding: "10px",
        marginTop: "12px",
        alignItems: "center",
        border: 1,
        borderRadius: "10px",
        borderColor: "border.main",
        bgcolor: "background.main",
        color: "text.primary",
        boxShadow: 12,
        minHeight: 60,
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2}>
                <Typography variant="h1" sx={{ fontSize: "22px" }}>
                  API Information:
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!query.isFetched && (
              <TableRow>
                <TableCell colSpan={2}>
                  <LinearProgress color="primary" />
                </TableCell>
              </TableRow>
            )}
            {query.isFetched && query.data.status === "success" && (
              <>
                <TableRow>
                  <TableCell>Model:</TableCell>
                  <TableCell align="right">{query.data.result[0].output.model}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Version:</TableCell>
                  <TableCell align="right">{query.data.result[0].output.version}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Tag:</TableCell>
                  <TableCell align="right">{query.data.result[0].output.serviceTag}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Vendor:</TableCell>
                  <TableCell align="right">{query.data.result[0].output.vendor}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ports:</TableCell>
                  <TableCell align="right">{query.data.result[0].output.ports}</TableCell>
                </TableRow>
                {/* "Info" section */}
                {query.data.info.status === "success" && (
                  <>
                    <TableRow>
                      <TableCell>Total oversubscription ratio:</TableCell>
                      <TableCell align="right">{query.data.info.totalOversubscription}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Active oversubscription ratio:</TableCell>
                      <TableCell align="right">{query.data.info.activeOversubscription}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total switch ports:</TableCell>
                      <TableCell align="right">{query.data.info.totalPorts}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Active switch ports:</TableCell>
                      <TableCell align="right">{query.data.info.activePorts}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Uplink count:</TableCell>
                      <TableCell align="right">{query.data.info.uplinkCount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Uplink Speed:</TableCell>
                      <TableCell align="right">{query.data.info.uplinkSpeed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Uplink Ports:</TableCell>
                      <TableCell align="right">{query.data.info.uplinks.map((val) => `${val.port} `)}</TableCell>
                    </TableRow>
                  </>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Switches
