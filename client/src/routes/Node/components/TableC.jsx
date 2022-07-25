import {
  Table,
  Box,
  TableHead,
  TableRow,
  TableCell,
  Button,
  TableBody,
  Typography,
  TableContainer,
  DialogContent,
  Dialog,
  Skeleton,
} from "@mui/material"
import { useEffect, useState, useContext } from "react"
// import SELTable from "./SELTable"
import IconC from "../../../components/IconC"
// import ErrorC from "../../../components/ErrorC"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"

import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const TableC = ({ node, refetch }) => {
  // const [apiData, setApiData] = useState({})
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState("")
  const [user, setUser] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  // useEffect(() => {
  //   setLoading(true)
  //   setError("")
  //   let payload = {
  //     headers: {
  //       "x-access-token": user.accessToken,
  //     },
  //   }
  //   fetch(`${apiConfig.apiUrl}/redfish/dell/${node}`, payload)
  //     .then((res) => res.json())
  //     .then((response) => {
  //       if (response.status === "success") {
  //         setApiData(response.result)
  //         let arr = Object.values(response.result)
  //         arr.forEach((val, index) => {
  //           if (val.status === "error" && val.message !== "No GPU tag") {
  //             setError(val.message)
  //           }
  //         })
  //       } else {
  //         setError("SEL API error")
  //       }
  //       setLoading(false)
  //     })
  //   return () => {
  //     setLoading(true)
  //     setError("")
  //     setApiData({})
  //   }
  // }, [node])

  const query_systems = useQuery(
    ["systems", node],
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/systems/${node}`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { retry: 2 }
  )

  const query_managers = useQuery(
    ["managers", node],
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/managers/${node}`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { retry: 2 }
  )

  const query_gpu = useQuery(
    ["gpu", node],
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/gpu/${node}`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { retry: 2 }
  )

  const query_storage = useQuery(
    ["storage", node],
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/storage/${node}`, payload)
      ).json()
      if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { retry: 2 }
  )

  const [openSEL, setOpenSEL] = useState(false)
  const handleOpenSEL = () => setOpenSEL(true)
  const handleCloseSEL = () => setOpenSEL(false)

  // function gpuhtml() {
  //   let res = []
  //   apiData.gpuRes.GPUs.forEach((val, index) => {
  //     res.push(
  //       <TableRow key={index}>
  //         <TableCell>GPU {index + 1}:</TableCell>
  //         <TableCell align="right">{val.Name}</TableCell>
  //         <TableCell align="center">
  //           <IconC icon={val.Health} />
  //         </TableCell>
  //       </TableRow>
  //     )
  //   })
  //   return res
  // }
  return (
    <Box
      sx={{
        padding: "10px",
        marginTop: "12px",
        alignItems: "center",
        border: 1,
        borderRadius: "10px",
        borderColor: "border.main",
        bgcolor: "background.main",
        color: "text.primary",
        boxShadow: 12,
      }}
    >
      {/* {loading && <LinearProgress />}
      {error !== "" && <ErrorC message={error} />} */}
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h1" sx={{ fontSize: "22px" }}>
                    Redfish API Information:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" onClick={handleOpenSEL}>
                    Show SEL
                  </Button>
                </TableCell>
                <TableCell align="right" width={"20px"}>
                  <Typography variant="h1" sx={{ fontSize: "16px" }}>
                    Health
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Model:</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>{query_systems.data.model}</>
                    )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Service Tag:</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>{query_systems.data.serviceTag}</>
                    )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BIOS Version:</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>{query_systems.data.biosVersion}</>
                    )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMC Version:</TableCell>
                <TableCell align="right">
                  {query_managers.isLoading && <Skeleton />}
                  {!query_managers.isLoading &&
                    query_managers.data.status === "success" && (
                      <>{query_managers.data.BMCVersion}</>
                    )}
                </TableCell>
                <TableCell align="center">
                  {query_managers.isLoading && (
                    <Skeleton variant="circular" width={25} height={25} />
                  )}
                  {!query_managers.isLoading &&
                    query_managers.data.status === "success" && (
                      <IconC icon={query_managers.data.BMCStatus} />
                    )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vlan:</TableCell>
                <TableCell align="right">
                  {query_managers.isLoading && <Skeleton />}
                  {!query_managers.isLoading &&
                    query_managers.data.status === "success" && (
                      <>{query_managers.data.VLAN.VLANId}</>
                    )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Boot Order:</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>{query_systems.data.bootOrder}</>
                    )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory Size:</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>{query_systems.data.totalMemory}</>
                    )}
                </TableCell>
                <TableCell align="center">
                  {query_systems.isLoading && (
                    <Skeleton variant="circular" width={25} height={25} />
                  )}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <IconC icon={query_systems.data.memoryStatus} />
                    )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Processor(s):</TableCell>
                <TableCell align="right">
                  {query_systems.isLoading && <Skeleton />}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <>
                        {query_systems.data.processorCount}
                        {"x "}
                        {query_systems.data.processorModel}
                        <br />
                        {"Cores: "}
                        {query_systems.data.processorCores}
                        {" |  Logical Processor: "}
                        {query_systems.data.logicalProc}
                      </>
                    )}
                </TableCell>
                <TableCell align="center">
                  {query_systems.isLoading && (
                    <Skeleton variant="circular" width={25} height={25} />
                  )}
                  {!query_systems.isLoading &&
                    query_systems.data.status === "success" && (
                      <IconC icon={query_systems.data.processorStatus} />
                    )}
                </TableCell>
              </TableRow>
              {query_gpu.isLoading && (
                <TableRow>
                  <TableCell>GPU(s)</TableCell>
                  <TableCell align="right">
                    <Skeleton />
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              {!query_gpu.isLoading &&
                query_gpu.data.status === "success" &&
                query_gpu.data.physical > 0 &&
                query_gpu.data.GPUs.map((val, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>GPU {index + 1}</TableCell>
                      <TableCell align="right">
                        {val.model}
                        {query_gpu.data.vGPU &&
                          ` (vGPU: x${
                            query_gpu.data.virtual / query_gpu.data.physical
                          })`}
                      </TableCell>
                      <TableCell align="center">
                        <IconC icon={val.GPUStatus} />
                      </TableCell>
                    </TableRow>
                  )
                })}

              <TableRow>
                <TableCell>Storage:</TableCell>
                <TableCell align="right">
                  {query_storage.isLoading && <Skeleton />}
                  {!query_storage.isLoading &&
                    query_storage.data.status === "success" && (
                      <>{query_storage.data.controller}</>
                    )}
                </TableCell>
                <TableCell align="center">
                  {!query_storage.isLoading &&
                    query_storage.data.status === "success" && (
                      <IconC icon={query_storage.data.cardStatus} />
                    )}
                </TableCell>
              </TableRow>
              {!query_storage.isLoading &&
                query_storage.data.status === "success" &&
                query_storage.data.volumes.map((val, index) => {
                  if (val.RAIDType !== null)
                    return (
                      <TableRow key={index}>
                        <TableCell>{val.name}</TableCell>
                        <TableCell align="right">
                          {val.RAIDType} {val.capacity}
                        </TableCell>
                        <TableCell align="center">
                          <IconC icon={val.driveStatus} />
                        </TableCell>
                      </TableRow>
                    )
                })}

              {!query_storage.isLoading &&
                query_storage.data.status === "success" &&
                query_storage.data.drives.map((val, index) => {
                  let tmp = ""
                  if (val.rotationSpeed !== null)
                    tmp = `${val.rotationSpeed} RPM`
                  let output = `${val.manufacturer} ${val.mediaType}:  ${val.capacity} ${tmp}`
                  return (
                    <TableRow key={index}>
                      <TableCell>{val.name}</TableCell>
                      <TableCell align="right">{output}</TableCell>
                      <TableCell align="center">
                        <IconC icon={val.driveStatus} />
                      </TableCell>
                    </TableRow>
                  )
                })}

              {/* {apiData.gpuRes.status === "success" && gpuhtml()} */}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
          <Dialog open={openSEL} onClose={handleCloseSEL} maxWidth="xl">
            <DialogContent>
              {/* <SELTable data={apiData.selRes.sel.entries} /> */}
              <Box
                sx={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button onClick={handleCloseSEL} variant="outlined">
                  Close
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </div>
      </>
    </Box>
  )
}

export default TableC
