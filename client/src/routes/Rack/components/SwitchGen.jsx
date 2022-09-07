import { Button, LinearProgress, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import React, { useContext, useState } from "react"

import { Link } from "react-router-dom"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const SwitchGen = ({ node, u, tags }) => {
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
      else {
        if (res.data[0].port.match(/[0-9]\/[0-9]\/[0-9]/g)) {
          let firstBlade = parseInt(res.data[0].port.split("/")[0])
          let lastBlade = parseInt(res.data[res.data.length - 1].port.split("/")[0])
          let bladeArr = new Array()

          for (let x = firstBlade; x <= lastBlade; x++) {
            bladeArr.push(
              res.data
                .map((val, index) => {
                  let portArr = val.port.split("/")
                  if (parseInt(portArr[0]) === x) {
                    if (val.speed === "10G" && portArr[2] === "1")
                      return [val, res.data[index + 1], res.data[index + 2], res.data[index + 3]]
                    else if (val.speed !== "10G" && portArr[2] === "1") return val
                  }
                })
                .filter(Boolean)
            )
          }

          res.client = bladeArr.map((blade, index) => {
            let color = "secondary"
            return (
              <TableRow key={index}>
                <TableCell sx={{ padding: "2px" }}>
                  {Array.isArray(blade[index]) && blade[index][0].port.split("/")[0]}
                  {!Array.isArray(blade[index]) && blade[index].port.split("/")[0]}
                </TableCell>
                {blade.map((port, index) => {
                  if (Array.isArray(port)) {
                    return (
                      <React.Fragment key={index}>
                        <TableCell sx={{ padding: "3px" }}>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ padding: "2px" }}>
                                  {blade[index][0].port.split("/")[1]}
                                </TableCell>
                              </TableRow>
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
                                        <Button
                                          color={color}
                                          disabled={disabled}
                                          variant="contained"
                                          size="small"
                                          sx={{ minWidth: "35px", width: "35px" }}
                                        >
                                          {`${splitPort.port.split("/")[1]}/${splitPort.port.split("/")[2]}`}
                                        </Button>
                                      </TableCell>
                                    )
                                  }
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
                                        <Button
                                          color={color}
                                          disabled={disabled}
                                          variant="contained"
                                          size="small"
                                          sx={{ minWidth: "35px", width: "35px" }}
                                        >
                                          {`${splitPort.port.split("/")[1]}/${splitPort.port.split("/")[2]}`}
                                        </Button>
                                      </TableCell>
                                    )
                                  }
                                })}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableCell>
                      </React.Fragment>
                    )
                  } else {
                    if (port.speed === "40G") color = "primary"
                    else if (port.speed === "100G") color = "error"
                    let disabled = false
                    if (port.status === "down") disabled = true
                    let portArr = port.port.split("/")

                    return (
                      <TableCell key={index} align="center">
                        <Button variant="contained" color={color} disabled={disabled} size="small">
                          {portArr[1]}
                        </Button>
                      </TableCell>
                    )
                  }
                })}
              </TableRow>
            )
          })
        } else {
          res.client = res.data.map((val, index) => {
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
                <Button
                  variant="contained"
                  color={color}
                  disabled={disabled}
                  sx={{ minWidth: "35px", width: "35px" }}
                  size="small"
                >
                  {val.port}
                </Button>
              </TableCell>
            )
          })
        }
      }
      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  //   const macAddressQuery = useQuery("macAddress", async ({ signal }) => {
  //     let payload = {
  //       headers: {
  //         "x-access-token": user.accessToken,
  //       },
  //       signal,
  //     }
  //     const res = await (
  //       await fetch(`${apiConfig.apiUrl}/switches/macAddressTable/${node}`, payload)
  //     ).json()
  //     if (res.status === "error")
  //       enqueueSnackbar(res.message, { variant: "error" })
  //     return res
  //   })

  //   const nodeQuery = useQuery("nodes", async ({ signal }) => {
  //     let payload = {
  //       headers: {
  //         "x-access-token": user.accessToken,
  //       },
  //       signal,
  //     }
  //     const res = await (
  //       await fetch(`${apiConfig.apiUrl}/grendel/host/list`, payload)
  //     ).json()
  //     if (res.status === "error")
  //       enqueueSnackbar(res.message, { variant: "error" })
  //     return res
  //   })

  return (
    <>
      <TableRow>
        <TableCell align="center">{u}</TableCell>
        <TableCell align="center" sx={{ paddingRight: 0, paddingLeft: 0 }}>
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
                      })}
                  </TableRow>
                  <TableRow>
                    {interfacesQuery.isFetched &&
                      interfacesQuery.data.status === "success" &&
                      interfacesQuery.data.client.map((val, index) => {
                        if (index % 2) return <React.Fragment key={index}>{val}</React.Fragment>
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
