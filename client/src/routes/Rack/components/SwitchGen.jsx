import {
  Button,
  Grow,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import React, { useContext } from "react"

import { Link } from "react-router-dom"
import TooltipGen from "./TooltipGen"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const SwitchGen = ({ node, u, tags, height }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const interfacesQuery = useQuery(
    ["interfaces", node],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/interfaces/${node}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  const macAddressQuery = useQuery(
    ["macAddress", node],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/macAddressTable/${node}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  const nodeQuery = useQuery(["nodes", node], async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/grendel/host/list`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
    return res
  })

  if (interfacesQuery.isFetched && interfacesQuery.data.status === "success") {
    if (interfacesQuery.data.data[0].port.match(/[0-9]\/[0-9]\/[0-9]/g)) {
      // core switch only
      let firstBlade = parseInt(interfacesQuery.data.data[0].port.split("/")[0])
      let lastBlade = parseInt(interfacesQuery.data.data[interfacesQuery.data.data.length - 1].port.split("/")[0])
      let bladeArr = []

      for (let x = firstBlade; x <= lastBlade; x++) {
        // separate the port array into blades
        bladeArr.push(
          interfacesQuery.data.data
            .map((val, index) => {
              let portArr = val.port.split("/")
              if (parseInt(portArr[0]) === x) {
                if (val.speed === "10G" && portArr[2] === "1")
                  return [
                    val,
                    interfacesQuery.data.data[index + 1],
                    interfacesQuery.data.data[index + 2],
                    interfacesQuery.data.data[index + 3],
                  ]
                else if (val.speed !== "10G" && portArr[2] === "1") return val
              }
              return undefined
            })
            .filter(Boolean)
        )
      }

      interfacesQuery.data.client = bladeArr.map((blade, index) => {
        // portmapping for each blade
        let color = "secondary"
        return (
          <React.Fragment key={index}>
            <TableRow>
              <TableCell rowSpan={4} sx={{ padding: "2px", border: 1, borderColor: "border.secondary" }}>
                <Typography sx={{ transform: "rotate(270deg)", whiteSpace: "nowrap" }}>
                  {Array.isArray(blade[index]) && `Blade: ${blade[index][0].port.split("/")[0]}`}
                  {!Array.isArray(blade[index]) && `Blade: ${blade[index].port.split("/")[0]}`}
                </Typography>
              </TableCell>
            </TableRow>
            {/* Port labels */}
            <TableRow>
              {blade.map((port, index) => {
                if (!(index % 2)) {
                  if (Array.isArray(port)) {
                    return (
                      <TableCell
                        key={index}
                        sx={{ padding: "3px", paddingTop: "10px", border: 1, borderColor: "border.secondary" }}
                        align="center"
                      >
                        {port[0].port.split("/")[1]}
                      </TableCell>
                    )
                  } else {
                    return (
                      <TableCell
                        key={index}
                        sx={{ padding: "3px", paddingTop: "10px", border: 1, borderColor: "border.secondary" }}
                        align="center"
                      >
                        {port.port.split("/")[1]}
                      </TableCell>
                    )
                  }
                } else return undefined
              })}
            </TableRow>
            {/* Odd ports */}
            <TableRow>
              {blade.map((port, index) => {
                if (!(index % 2)) {
                  if (Array.isArray(port)) {
                    return (
                      <React.Fragment key={index}>
                        <TableCell sx={{ padding: "3px" }}>
                          <Table>
                            <TableBody sx={{ border: 1, borderColor: "border.main", borderWidth: 2 }}>
                              <TableRow>
                                {port.map((splitPort, index) => {
                                  let disabled = false
                                  if (splitPort.status === "down") disabled = true
                                  if (!(index % 2)) {
                                    if (splitPort.speed === "1G") color = "warning"
                                    else if (splitPort.speed === "10G") color = "success"
                                    return (
                                      <TableCell
                                        style={{
                                          width: "30px",
                                          padding: "3px",
                                        }}
                                        align="center"
                                        key={index}
                                      >
                                        <Tooltip
                                          arrow
                                          placement="top"
                                          title={<TooltipGen port={splitPort} query={macAddressQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              sx={{ minWidth: "35px", width: "35px" }}
                                            >
                                              {`${splitPort.port.split("/")[2]}`}
                                            </Button>
                                          </span>
                                        </Tooltip>
                                      </TableCell>
                                    )
                                  } else return undefined
                                })}
                              </TableRow>
                              <TableRow>
                                {port.map((splitPort, index) => {
                                  let disabled = false
                                  if (splitPort.status === "down") disabled = true
                                  if (index % 2) {
                                    if (splitPort.speed === "1G") color = "warning"
                                    else if (splitPort.speed === "10G") color = "success"
                                    return (
                                      <TableCell
                                        style={{
                                          width: "30px",
                                          padding: "3px",
                                        }}
                                        align="center"
                                        key={index}
                                      >
                                        <Tooltip
                                          arrow
                                          placement="bottom"
                                          title={<TooltipGen port={splitPort} query={macAddressQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              sx={{ minWidth: "35px", width: "35px" }}
                                            >
                                              {`${splitPort.port.split("/")[2]}`}
                                            </Button>
                                          </span>
                                        </Tooltip>
                                      </TableCell>
                                    )
                                  } else return undefined
                                })}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableCell>
                      </React.Fragment>
                    )
                  } else {
                    // regular ports
                    if (port.speed === "40G") color = "primary"
                    else if (port.speed === "100G") color = "error"
                    let disabled = false
                    if (port.status === "down") disabled = true
                    let portArr = port.port.split("/")

                    return (
                      <TableCell key={index} align="center">
                        <Tooltip
                          arrow
                          placement={!(index % 2) ? "top" : "bottom"}
                          title={<TooltipGen port={port} query={macAddressQuery} />}
                        >
                          <span>
                            <Button variant="contained" color={color} disabled={disabled} size="small">
                              {portArr[1]}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )
                  }
                } else return undefined
              })}
            </TableRow>
            {/* Even ports */}
            <TableRow>
              {blade.map((port, index) => {
                if (index % 2) {
                  if (Array.isArray(port)) {
                    return (
                      <React.Fragment key={index}>
                        <TableCell sx={{ padding: "3px" }}>
                          <Table>
                            <TableBody sx={{ border: 1, borderColor: "border.main", borderWidth: 2 }}>
                              <TableRow>
                                {port.map((splitPort, index) => {
                                  let disabled = false
                                  if (splitPort.status === "down") disabled = true
                                  if (!(index % 2)) {
                                    if (splitPort.speed === "1G") color = "warning"
                                    else if (splitPort.speed === "10G") color = "success"
                                    return (
                                      <TableCell
                                        style={{
                                          width: "30px",
                                          padding: "3px",
                                        }}
                                        sx={{ border: 0 }}
                                        align="center"
                                        key={index}
                                      >
                                        <Tooltip
                                          arrow
                                          placement="top"
                                          title={<TooltipGen port={splitPort} query={macAddressQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              sx={{ minWidth: "35px", width: "35px" }}
                                            >
                                              {`${splitPort.port.split("/")[2]}`}
                                            </Button>
                                          </span>
                                        </Tooltip>
                                      </TableCell>
                                    )
                                  } else return undefined
                                })}
                              </TableRow>
                              <TableRow>
                                {port.map((splitPort, index) => {
                                  let disabled = false
                                  if (splitPort.status === "down") disabled = true
                                  if (index % 2) {
                                    if (splitPort.speed === "1G") color = "warning"
                                    else if (splitPort.speed === "10G") color = "success"
                                    return (
                                      <TableCell
                                        style={{
                                          width: "30px",
                                          padding: "3px",
                                        }}
                                        sx={{ border: 0 }}
                                        align="center"
                                        key={index}
                                      >
                                        <Tooltip
                                          arrow
                                          placement="bottom"
                                          title={<TooltipGen port={splitPort} query={macAddressQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              sx={{ minWidth: "35px", width: "35px" }}
                                            >
                                              {`${splitPort.port.split("/")[2]}`}
                                            </Button>
                                          </span>
                                        </Tooltip>
                                      </TableCell>
                                    )
                                  } else return undefined
                                })}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableCell>
                      </React.Fragment>
                    )
                  } else {
                    // regular ports
                    if (port.speed === "40G") color = "primary"
                    else if (port.speed === "100G") color = "error"
                    let disabled = false
                    if (port.status === "down") disabled = true
                    let portArr = port.port.split("/")

                    return (
                      <TableCell key={index} align="center">
                        <Tooltip
                          classes={{ tooltip: { maxWidth: 600 } }}
                          arrow
                          placement={!(index % 2) ? "top" : "bottom"}
                          title={<TooltipGen port={port} query={macAddressQuery} />}
                        >
                          <span>
                            <Button variant="contained" color={color} disabled={disabled} size="small">
                              {portArr[1]}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )
                  }
                } else return undefined
              })}
            </TableRow>
          </React.Fragment>
        )
      })
    } else {
      // leaf switches
      interfacesQuery.data.client = interfacesQuery.data.data.map((val, index) => {
        let color = "secondary"
        if (val.speed === "100M") color = "warning"
        else if (val.speed === "1G") color = "success"
        else if (val.speed === "10G") color = "primary"
        else if (val.speed === "40G") color = "error"
        else if (val.speed === "100G") color = "error"
        let disabled = false
        if (val.status === "down") disabled = true
        return (
          <TableCell
            key={index}
            style={{
              width: "30px",
              padding: "3px",
            }}
          >
            <Tooltip
              title={<TooltipGen port={val} query={macAddressQuery} nodeQuery={nodeQuery} />}
              TransitionComponent={Grow}
              placement={!(index % 2) ? "top" : "bottom"}
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  color={color}
                  disabled={disabled}
                  sx={{ minWidth: "35px", width: "35px" }}
                  size="small"
                >
                  {val.port}
                </Button>
              </span>
            </Tooltip>
          </TableCell>
        )
      })
    }
  }
  return (
    <>
      <TableRow>
        <TableCell align="center">{u}</TableCell>
        <TableCell align="center" sx={{ paddingRight: 0, paddingLeft: 0 }} rowSpan={height}>
          {interfacesQuery.isFetching && <LinearProgress color="primary" sx={{ marginBottom: "10px" }} />}
          <Link to={`/Node/${node}`}>{node}</Link>
          <TableContainer>
            <Table>
              {!tags.includes("core-switch") && (
                <TableBody>
                  <TableRow>
                    {interfacesQuery.isFetched &&
                      interfacesQuery.data.status === "success" &&
                      interfacesQuery.data.client.map((val, index) => {
                        if (!(index % 2)) return <React.Fragment key={index}>{val}</React.Fragment>
                        else return undefined
                      })}
                  </TableRow>
                  <TableRow>
                    {interfacesQuery.isFetched &&
                      interfacesQuery.data.status === "success" &&
                      interfacesQuery.data.client.map((val, index) => {
                        if (index % 2) return <React.Fragment key={index}>{val}</React.Fragment>
                        else return undefined
                      })}
                  </TableRow>
                </TableBody>
              )}
              {tags.includes("core-switch") && (
                <TableBody>
                  {interfacesQuery.isFetched &&
                    interfacesQuery.data.status === "success" &&
                    interfacesQuery.data.client.map((val, index) => {
                      return <React.Fragment key={index}>{val}</React.Fragment>
                    })}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </TableCell>
      </TableRow>
    </>
  )
}

export default SwitchGen
