import {
  Box,
  Checkbox,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
} from "@mui/material"
import React, { useContext, useState } from "react"

import BgContainer from "../components/BgContainer"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import MenuIcon from "@mui/icons-material/Menu"
import Node from "./Rack/Node"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Rack = () => {
  const { rack } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [user] = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const [colorDisplay, setColorDisplay] = useState("")
  const [textDisplay, setTextDisplay] = useState("name")
  const [tableRef] = useAutoAnimate(null)

  const query = useQuery(
    ["rack", rack],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/client/v1/rack/${rack}`, payload)).json()
      if (res.status === "error" && !res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "error" && res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { staleTime: 120000, cacheTime: 120000 }
  )

  return (
    <BgContainer>
      <Box sx={{ display: "flex" }}>
        <Drawer variant="persistent" anchor="right" open={open} width={240}>
          <Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Display</InputLabel>
              <Select
                value={textDisplay}
                label="Display"
                onChange={(e) => {
                  setTextDisplay(e.target.value)
                  // localStorage.setItem("floorPlanOutputType", e.target.value)
                }}
              >
                <MenuItem value={"name"}>Name</MenuItem>
                <MenuItem value={"interfaces"}>Interfaces</MenuItem>
                <MenuItem value={"compute"}>Compute Resources</MenuItem>
                <MenuItem value={"gpus"}>GPUs</MenuItem>
                <MenuItem value={"storage"}>Storage</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Drawer>
        <Box component="main">
          <TableContainer ref={tableRef}>
            {query.isFetching && <LinearProgress />}
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell align={"center"} width={40}>
                    U
                  </TableCell>
                  <TableCell align={"center"}>{rack}</TableCell>
                  <TableCell width={40}>
                    <IconButton color="inherit" onClick={() => setOpen(!open)} edge="start" sx={{ mr: 2 }}>
                      {!open && <MenuIcon />}
                      {open && <ChevronRightIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.isFetched &&
                  query.data.status === "success" &&
                  query.data.nodes.map((val, index) => (
                    <TableRow key={index}>
                      {val.type === "rowSpan" && (
                        <>
                          <TableCell align="center">{val.u}</TableCell>
                        </>
                      )}
                      {val.type === "node" && val.height > 0 && (
                        <>
                          <TableCell align={"center"}>{val.u}</TableCell>
                          <TableCell align={"center"} rowSpan={val.height} sx={{ border: 1 }}>
                            <Node node={val} />
                          </TableCell>
                          <TableCell align={"center"} rowSpan={val.height}>
                            <Checkbox />
                          </TableCell>
                        </>
                      )}
                      {val.type === "" && (
                        <>
                          <TableCell align={"center"}>{val.u}</TableCell>
                          <TableCell align={"center"}></TableCell>
                          <TableCell align={"center"}></TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </BgContainer>
  )
}

export default Rack
