import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

import { Link } from "react-router-dom"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const CoreSwitch = ({ node }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery("switches", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/switches/coreSwitch/${node}`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
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
        height: "auto",
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
              {/* Blades */}
              {query.data.portMapping !== undefined &&
                query.data.portMapping.map((blade, index) => {
                  if (index !== 0) {
                    return (
                      <TableRow key={"blade" + index}>
                        <TableCell>{index}</TableCell>
                        <TableCell>
                          {/* Ports */}
                          <TableContainer>
                            <Table size="small" padding="none">
                              <TableBody>
                                <TableRow>
                                  {/* Numbering */}
                                  {blade !== null &&
                                    blade.map((port, index) => {
                                      if (index !== 0 && index % 2)
                                        return (
                                          <TableCell
                                            align="center"
                                            key={"numbering" + index}
                                            sx={{
                                              paddingBottom: "5px",
                                              border: 0,
                                            }}
                                          >
                                            {index}
                                          </TableCell>
                                        )
                                    })}
                                </TableRow>
                                {/* Top Ports */}
                                <TableRow>
                                  {blade !== null &&
                                    blade.map((port, index) => {
                                      if (index !== 0 && index % 2) {
                                        if (port !== null && port.uplinkSpeed > 10) {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                              }}
                                            >
                                              {
                                                <Link to={`/Node/${port.mapping[1].hostname}`}>
                                                  {port.mapping[1].hostname}
                                                </Link>
                                              }
                                            </TableCell>
                                          )
                                        } else if (port !== null && port.uplinkSpeed === 10) {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                                borderColor: "primary.main",
                                              }}
                                            >
                                              <Table size="small" padding="none" sx={{ borderCollapse: "separate" }}>
                                                <TableBody>
                                                  <TableRow>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[1] !== null && (
                                                        <Link to={`/Node/${port.mapping[1].hostname}`}>
                                                          {port.mapping[1].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[1] === null && "1"}
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[3] !== null && (
                                                        <Link to={`/Node/${port.mapping[3].hostname}`}>
                                                          {port.mapping[3].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[3] === null && "3"}
                                                    </TableCell>
                                                  </TableRow>
                                                  <TableRow>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[2] !== null && (
                                                        <Link to={`/Node/${port.mapping[2].hostname}`}>
                                                          {port.mapping[2].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[2] === null && "2"}
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[4] !== null && (
                                                        <Link to={`/Node/${port.mapping[4].hostname}`}>
                                                          {port.mapping[4].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[4] === null && "4"}
                                                    </TableCell>
                                                  </TableRow>
                                                </TableBody>
                                              </Table>
                                            </TableCell>
                                          )
                                        } else {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                              }}
                                            >
                                              {" "}
                                              &nbsp;
                                            </TableCell>
                                          )
                                        }
                                      }
                                    })}
                                </TableRow>
                                {/* Bottom Ports */}
                                <TableRow>
                                  {blade !== null &&
                                    blade.map((port, index) => {
                                      if (index !== 0 && !(index % 2)) {
                                        if (port !== null && port.uplinkSpeed > 10) {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                              }}
                                            >
                                              {
                                                <Link to={`/Node/${port.mapping[1].hostname}`}>
                                                  {port.mapping[1].hostname}
                                                </Link>
                                              }
                                            </TableCell>
                                          )
                                        } else if (port !== null && port.uplinkSpeed === 10) {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                                borderColor: "primary.main",
                                              }}
                                            >
                                              <Table size="small" padding="none" sx={{ borderCollapse: "separate" }}>
                                                <TableBody>
                                                  <TableRow>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[1] !== null && (
                                                        <Link to={`/Node/${port.mapping[1].hostname}`}>
                                                          {port.mapping[1].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[1] === null && "1"}
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[3] !== null && (
                                                        <Link to={`/Node/${port.mapping[3].hostname}`}>
                                                          {port.mapping[3].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[3] === null && "3"}
                                                    </TableCell>
                                                  </TableRow>
                                                  <TableRow>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[2] !== null && (
                                                        <Link to={`#/Nodes/${port.mapping[2].hostname}`}>
                                                          {port.mapping[2].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[2] === null && "2"}
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      sx={{
                                                        border: 1,
                                                        borderColor: "primary.main",
                                                        minWidth: "55px",
                                                        height: "43px",
                                                      }}
                                                    >
                                                      {port.mapping[4] !== null && (
                                                        <Link to={`#/Nodes/${port.mapping[4].hostname}`}>
                                                          {port.mapping[4].hostname}
                                                        </Link>
                                                      )}
                                                      {port.mapping[4] === null && "4"}
                                                    </TableCell>
                                                  </TableRow>
                                                </TableBody>
                                              </Table>
                                            </TableCell>
                                          )
                                        } else {
                                          return (
                                            <TableCell
                                              key={"port" + index}
                                              align="center"
                                              sx={{
                                                minWidth: "110px",
                                                height: "90px",
                                                border: 1,
                                              }}
                                            >
                                              {" "}
                                              &nbsp;
                                            </TableCell>
                                          )
                                        }
                                      }
                                    })}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </TableCell>
                      </TableRow>
                    )
                  }
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default CoreSwitch
