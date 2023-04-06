import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import { green, grey, orange } from "@mui/material/colors"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import formatReadable from "../../components/formatReadable"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

// TODO: fix useEffect
// TODO: change query to mutation
// TODO: improve warranty card

const Redfish = ({ query, setRefresh }) => {
  let data = query.data.redfish

  const [openSEL, setOpenSEL] = useState(false)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const clearSEL_query = useQuery(
    ["clearSel-node", query],
    async ({ signal }) => {
      setRefresh("true")
      let payload = {
        method: "PUT",
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/redfish/v1/clearSEL/${query.data.node}`, payload)).json()
      enqueueSnackbar(res.message, { variant: res.status })
      query.refetch()
      return res
    },
    { enabled: false }
  )

  if (data === undefined)
    return (
      <Typography variant="h1" fontSize={20}>
        No Redfish data found!
      </Typography>
    )
  if (data.success === false)
    return (
      <Typography variant="h1" fontSize={20}>
        Error querying node: {data.error === undefined ? data.message : data.error?.code}
      </Typography>
    )

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Grid2 container spacing={1}>
          <Grid2 xs={12} sm={6} lg={3}>
            <Card variant="outlined" sx={{ height: "190px" }}>
              <CardContent>
                <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                  Model: {data.model}
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  Manufacturer: {data.manufacturer}
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  Service Tag: {data.service_tag}
                </Typography>
                <Typography variant="h1" fontSize={14}>
                  BIOS Version: {data.bios_version}
                </Typography>
                <Typography variant="h2" fontSize={14} sx={{ marginBottom: "5px" }}>
                  BMC Version: {data.bmc.version}
                </Typography>
                <Typography variant="h1" fontSize={16}>
                  Memory: {formatReadable(data.memory.total_size_MiB, 0, "MB")} at {data.memory.speed_MHz} MHz
                </Typography>
                {/* <Typography variant="h1" fontSize={14}>
                  Boot Order: {data.boot_info.map((val) => val.name).join(", ")}
                </Typography> */}
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 xs={12} sm={6} lg={3}>
            <Card variant="outlined" sx={{ height: "190px" }}>
              <CardContent>
                <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                  BMC
                </Typography>
                <Typography variant="h1" fontSize={16}>
                  Address: {data.bmc.ip} ({data.bmc.type})
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  Gateway: {data.bmc.gateway}
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  VLAN: {data.bmc.vlan}
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  DNS: {data.bmc.dns.join(", ")}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 xs={12} sm={6} lg={3}>
            <Card variant="outlined" sx={{ height: "190px", overflowY: "scroll" }}>
              <CardContent>
                <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                  Volumes
                </Typography>
                {data.storage.map((adapter) => {
                  return adapter.volumes.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h1" fontSize={16}>
                        Name: {val.name}
                      </Typography>
                      <Typography variant="h1" fontSize={14}>
                        Type: {val.volume_type} {val.raid_type}
                      </Typography>
                      <Typography variant="h1" fontSize={14} sx={{ marginBottom: "5px" }}>
                        Capacity: {formatReadable(val.capacity)}
                      </Typography>
                    </React.Fragment>
                  ))
                })}
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 xs={12} sm={6} lg={3}>
            <Card
              variant="outlined"
              sx={{ height: "190px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <CardContent>
                <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                  System Event Log
                </Typography>
                <Typography variant="h1" fontSize={16}>
                  Count: {data.sel.count}
                </Typography>
                <Typography variant="h1" fontSize={14}>
                  Latest Log: {data.sel.logs[0]?.message}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Button variant="outlined" size="small" onClick={() => setOpenSEL(!openSEL)}>
                  Show
                </Button>
                <Button variant="outlined" size="small" onClick={() => clearSEL_query.refetch()}>
                  {clearSEL_query.isFetching ? <CircularProgress size={24} /> : "Clear"}
                </Button>
              </CardActions>
            </Card>
          </Grid2>

          <Dialog open={openSEL} onClose={() => setOpenSEL(false)} maxWidth="xl">
            <DialogContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        System Event Logs
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">Time:</TableCell>
                      <TableCell align="center">Severity:</TableCell>
                      <TableCell align="center">Message:</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.sel.logs.map((val, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(val.created).toLocaleString()}</TableCell>
                        <TableCell>{val.severity}</TableCell>
                        <TableCell>{val.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenSEL(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Grid2 xs={12}>
            <Divider />
          </Grid2>
          {data.processor.processors.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    CPUs
                  </Typography>
                  {data.processor.processors.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={16} sx={{ marginBottom: "5px" }}>
                        {index + 1}: {val.model.split("@")[0]}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Architecture: {val.architecture}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Cores: {val.total_cores}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Threads: {val.total_threads}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px", marginBottom: "10px" }}>
                        Frequency: {val.max_frequency} MHz
                      </Typography>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}
          {data.gpus.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    GPUs
                  </Typography>
                  {data.gpus.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={16} sx={{ marginBottom: "5px" }}>
                        {index + 1}: {val.model}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Manufacturer: {val.manufacturer}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px", marginBottom: "10px" }}>
                        Status: {val.status}
                      </Typography>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}

          {data.pcie.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    PCIe Devices
                  </Typography>
                  {data.pcie.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={16} sx={{ marginBottom: "5px" }}>
                        {index + 1}: {val.model}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Manufacturer: {val.manufacturer}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px", marginBottom: "10px" }}>
                        Status: {val.status}
                      </Typography>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}
          {data.storage.map((controller, index) => (
            <Grid2 xs={12} sm={6} lg={controller.slot_count < 12 ? 3 : 6} key={index}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  <TableContainer>
                    <Table
                      size="small"
                      sx={{ tableLayout: "fixed", height: "230px", width: `${controller.slot_count * 40}px` }}
                    >
                      <TableHead>
                        <TableRow>
                          {controller.drives.map((val, index) => (
                            <TableCell align="center" key={index}>
                              {index}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          {controller.drives.length > 0 &&
                            controller.drives.map((drive, index) => (
                              <TableCell
                                key={index}
                                sx={{
                                  border: 1,
                                  borderColor: grey[300],
                                  textOrientation: "mixed",
                                  writingMode: "vertical-rl",
                                }}
                              >
                                {drive.status !== "empty" && (
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <i
                                      className="bi bi-activity"
                                      style={{
                                        color: drive.status === "OK" ? green[300] : orange[300],
                                        fontSize: "15px",
                                      }}
                                    />
                                    <Box sx={{ display: "flex-col", textAlign: "center", height: "100%" }}>
                                      <Typography fontSize={12}>{drive.name}</Typography>
                                      <Typography fontSize={12}>{formatReadable(drive.capacity)}</Typography>
                                    </Box>
                                  </Box>
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid2>
          ))}

          {query.data.warranty.entitlements.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px", overflowY: "scroll" }}>
                <CardContent>
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    Warranty
                  </Typography>
                  {query.data.warranty.entitlements.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={14}>
                        Type: {val.entitlementType}
                      </Typography>
                      <Typography variant="h2" fontSize={12}>
                        Start: {new Date(val.startDate).toLocaleString()}
                      </Typography>
                      <Typography variant="h2" fontSize={12}>
                        End: {new Date(val.endDate).toLocaleString()}
                      </Typography>
                      <Typography variant="h2" fontSize={12}>
                        Code: {val.serviceLevelCode}
                      </Typography>
                      {query.data.warranty.entitlements.length > 1 &&
                        index < query.data.warranty.entitlements.length && <Divider sx={{ marginBottom: "5px" }} />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}

          <Grid2 xs={12} sx={{ marginTop: "5px", marginBottom: "5px" }}>
            <Divider />
          </Grid2>
          {data.network.map((adapter, adapter_index) => {
            return adapter.ports.map((port, port_index) => (
              <Grid2 xs={12} sm={6} lg={3} key={`${adapter_index},${port_index}`}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h1" fontSize={18}>
                      {port.id}
                    </Typography>
                    <Typography variant="h2" fontSize={16}>
                      Link: {port.link}
                    </Typography>
                    <Typography variant="h2" fontSize={16}>
                      Type: {port.type}
                    </Typography>
                    <Typography variant="h2" fontSize={16}>
                      MAC: {port.mac}
                    </Typography>
                    <Typography variant="h2" fontSize={16}>
                      Speed: {port.speed / 1000} Gb
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))
          })}
        </Grid2>
      </Box>
    </>
  )
}
export default Redfish
