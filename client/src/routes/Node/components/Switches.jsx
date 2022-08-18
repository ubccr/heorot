import {
  Box,
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

  const query = useQuery(["switch", node], async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    let rack = node.substring(4, 7)
    const res = await (
      await fetch(
        `${apiConfig.apiUrl}/switches/switch/${rack}/${node}`,
        payload
      )
    ).json()
    if (res.status === "error")
      enqueueSnackbar(res.message, { variant: "error" })
    return res
  })

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
      {query.isFetched && query.data.status === "success" && (
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
              <TableRow>
                <TableCell>Model:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.model}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vendor:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.vendor}
                </TableCell>
              </TableRow>
              {/* <TableRow>
                  <TableCell>Serial Number:</TableCell>
                  <TableCell>
                    {query.data.result.switches.serial_number}
                  </TableCell>
                </TableRow> */}
              <TableRow>
                <TableCell>OS Version:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.os_version}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Oversubscription Ratio:</TableCell>
                <TableCell align="right">
                  <b>{query.data.result.ratio}</b>
                </TableCell>
              </TableRow>
              {query.data.result.switches.cabling.ports.map((val, index) => (
                <TableRow key={index}>
                  <TableCell>Uplink Port {index + 1}</TableCell>
                  <TableCell align="right">
                    {val.leaf_port} : {val.spine_port}
                  </TableCell>
                </TableRow>
              ))}

              {query.data.result.switches.networks.map((val, index) => (
                <TableRow key={index}>
                  <TableCell>Network {index + 1}</TableCell>
                  <TableCell align="right">
                    {val.ipv4} : {val.vlan}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Spine:</TableCell>
                <TableCell align="right">{query.data.result.spine}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Nodes:</TableCell>
                <TableCell align="right">{query.data.result.nodes}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Port Speed:</TableCell>
                <TableCell align="right">
                  {query.data.result.port_speed} Gb
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Uplink Speed:</TableCell>
                <TableCell align="right">
                  {query.data.result.uplink_speed} Gb
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Interfaces:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.interfaces}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ports:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.ports}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>VLANs:</TableCell>
                <TableCell align="right">
                  {query.data.result.switches.vlans.join(", ")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default Switches
