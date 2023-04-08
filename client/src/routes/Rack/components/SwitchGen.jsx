import {
  Button,
  Grid,
  Grow,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import React, { useContext, useState } from "react"

import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined"
import { Link } from "react-router-dom"
import TooltipGen from "./TooltipGen"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const SwitchGen = ({ data }) => {
  let node = data.nodes[0].grendel.name
  let tags = data.nodes[0].grendel.tags

  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()
  const [refreshCache, setRefreshCache] = useState("false")

  const switchQuery = useQuery(
    ["switch", node, refreshCache],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/node/${node}/${refreshCache}`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent"))
        console.error(`Switch rack query failed: ${res.message}`)

      return res.switch_data
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  const nodeQuery = useQuery("nodes", async ({ signal }) => {
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
  const refetchQuery = () => {
    setRefreshCache("true")
    switchQuery.refetch()
  }
  if (switchQuery.isFetched && switchQuery.data && switchQuery.data.success === true) {
    if (
      switchQuery.data.interfaces.length > 0 &&
      switchQuery.data.interfaces[0].port.match(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]/g)
    ) {
      // core switch only
      let firstBlade = parseInt(switchQuery.data.interfaces[0].port.split("/")[0])
      let lastBlade = parseInt(switchQuery.data.interfaces[switchQuery.data.interfaces.length - 1].port.split("/")[0])
      let bladeArr = []
      for (let x = firstBlade; x <= lastBlade; x++) {
        // separate the port array into blades
        bladeArr.push(
          switchQuery.data.interfaces
            .map((val, index) => {
              let portArr = val.port.split("/")
              if (parseInt(portArr[0]) === x) {
                if (val.speed === "10G" && portArr[2] === "1")
                  return [
                    val,
                    switchQuery.data.interfaces[index + 1],
                    switchQuery.data.interfaces[index + 2],
                    switchQuery.data.interfaces[index + 3],
                  ]
                else if (val.speed !== "10G" && portArr[2] === "1") return val
              }
              return undefined
            })
            .filter(Boolean)
        )
      }

      switchQuery.data.client = bladeArr.map((blade, index) => {
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
                                  // This regex assumes the standard node naming convention used by Grendel
                                  let link =
                                    splitPort.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?") ??
                                    splitPort.port.split("/")[2]
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
                                          title={<TooltipGen port={splitPort} query={switchQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              component={Link}
                                              to={`/Node/${link[0]}`}
                                              sx={{
                                                width: "80px",
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {`${link[0]}`}
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
                                  // This regex assumes the standard node naming convention used by Grendel
                                  let link =
                                    splitPort.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?") ??
                                    splitPort.port.split("/")[2]
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
                                          title={<TooltipGen port={splitPort} query={switchQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              component={Link}
                                              to={`/Node/${link[0]}`}
                                              sx={{
                                                width: "80px",
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {`${link[0]}`}
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
                    // let portArr = port.port.split("/")
                    // This regex assumes the standard node naming convention used by Grendel
                    let link = port.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?")

                    return (
                      <TableCell key={index} align="center" sx={{ paddingLeft: "4px", paddingRight: "4px" }}>
                        <Tooltip
                          arrow
                          placement={!(index % 2) ? "top" : "bottom"}
                          title={<TooltipGen port={port} query={switchQuery} />}
                        >
                          <span>
                            <Button
                              variant="contained"
                              color={color}
                              disabled={disabled}
                              size="small"
                              component={Link}
                              to={`/Node/${link[0]}`}
                              sx={{ textTransform: "lowercase", whiteSpace: "nowrap" }}
                            >
                              {/* {portArr[1]} */}
                              {link[0]}
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
                                  // This regex assumes the standard node naming convention used by Grendel
                                  let link =
                                    splitPort.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?") ??
                                    splitPort.port.split("/")[2]
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
                                          title={<TooltipGen port={splitPort} query={switchQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              component={Link}
                                              to={`/Node/${link[0]}`}
                                              sx={{
                                                width: "80px",
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {`${link[0]}`}
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
                                  let link =
                                    splitPort.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?") ??
                                    splitPort.port.split("/")[2]
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
                                          title={<TooltipGen port={splitPort} query={switchQuery} />}
                                        >
                                          <span>
                                            <Button
                                              color={color}
                                              disabled={disabled}
                                              variant="contained"
                                              size="small"
                                              component={Link}
                                              to={`/Node/${link[0]}`}
                                              sx={{
                                                width: "80px",
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                fontSize: "10px",
                                              }}
                                            >
                                              {`${link[0]}`}
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
                    // let portArr = port.port.split("/")

                    let link,
                      port_name = ""
                    if (port.description === "") port_name = port.port
                    else {
                      link = port.description.match("[a-z]{3}-[a-z][0-9]{2}-[0-9]{2}(-0[1-2])?")
                      port_name = link
                    }

                    return (
                      <TableCell key={index} align="center" sx={{ paddingLeft: "4px", paddingRight: "4px" }}>
                        <Tooltip
                          classes={{ tooltip: { maxWidth: 600 } }}
                          arrow
                          placement={!(index % 2) ? "top" : "bottom"}
                          title={<TooltipGen port={port} query={switchQuery} />}
                        >
                          <span>
                            <Button
                              variant="contained"
                              color={color}
                              disabled={disabled}
                              size="small"
                              component={Link}
                              to={`/Node/${link}`}
                              sx={{ textTransform: "lowercase", whiteSpace: "nowrap" }}
                            >
                              {port_name}
                              {/* {portArr[1]} */}
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
      switchQuery.data.client = switchQuery.data.interfaces.map((val, index) => {
        let color = "secondary"
        if (val.speed === "100M" || val.speed === "10M") color = "warning"
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
              title={<TooltipGen port={val} query={switchQuery} nodeQuery={nodeQuery} />}
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
                  // component={Link}
                  // to={`/Node/${nodeLink}`}
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
      <Grid container>
        <Grid item xs={1}>
          <IconButton onClick={() => refetchQuery()} size="small" sx={{ float: "left" }}>
            <CachedOutlinedIcon />
          </IconButton>
        </Grid>
        <Grid item xs={10} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link to={`/Node/${node}`}>{node}</Link>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={12}>
          {switchQuery.isFetching && <LinearProgress color="primary" sx={{ marginBottom: "10px" }} />}
        </Grid>
      </Grid>
      <TableContainer sx={{ paddingRight: "5px", paddingLeft: "5px" }}>
        <Table>
          {!tags.includes("core-switch") && (
            <TableBody>
              <TableRow>
                {switchQuery.isFetched &&
                  switchQuery.data &&
                  switchQuery.data.success === true &&
                  switchQuery.data.client.map((val, index) => {
                    if (!(index % 2)) return <React.Fragment key={index}>{val}</React.Fragment>
                    else return undefined
                  })}
              </TableRow>
              <TableRow>
                {switchQuery.isFetched &&
                  switchQuery.data &&
                  switchQuery.data.success === true &&
                  switchQuery.data.client.map((val, index) => {
                    if (index % 2) return <React.Fragment key={index}>{val}</React.Fragment>
                    else return undefined
                  })}
              </TableRow>
            </TableBody>
          )}
          {tags.includes("core-switch") && (
            <TableBody>
              {switchQuery.isFetched &&
                switchQuery.data &&
                switchQuery.data.success === true &&
                switchQuery.data.client.map((val, index) => {
                  return <React.Fragment key={index}>{val}</React.Fragment>
                })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  )
}

export default SwitchGen
