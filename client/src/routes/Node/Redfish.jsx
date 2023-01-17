import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { green, grey, orange } from "@mui/material/colors"

import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

const Redfish = ({ query }) => {
  let data = query.data.redfish

  const [diskChassisArr, setDiskChassisArr] = useState([])
  useEffect(() => {
    // This should probably be server side
    if (
      !!data &&
      data.status !== "error" &&
      data.storage.slotCount !== null &&
      data.storage.drives[0].slot !== undefined
    ) {
      let slotCount_num = Number(data.storage.slot_count)
      let tmp_arr = new Array(slotCount_num)
      for (let x = 0; x < slotCount_num; x++) {
        let drive = data.storage.drives.find((val) => Number(val.slot) === x)
        if (drive) tmp_arr[x] = drive
        else tmp_arr[x] = { name: "", status: "empty" }
      }
      setDiskChassisArr(tmp_arr)
    } else if (!!data) {
      setDiskChassisArr(data.storage.drives)
    }
  }, [query])

  if (data === undefined)
    return (
      <Typography variant="h1" fontSize={20}>
        No Redfish data found!
      </Typography>
    )
  if (data.status === "error")
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
              {/* <CardMedia sx={{ height: "160px" }} image={dell_r740} /> */}
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
                {/* <Divider /> */}
                <Typography variant="h1" fontSize={14}>
                  BIOS Version: {data.bios_version}
                </Typography>
                <Typography variant="h2" fontSize={14} sx={{ marginBottom: "5px" }}>
                  BMC Version: {data.bmc.version}
                </Typography>
                <Typography variant="h1" fontSize={16}>
                  Memory: {data.memory.size} at {data.memory.speed}
                </Typography>
                <Typography variant="h1" fontSize={14}>
                  Boot Order: {data.boot_order}
                </Typography>
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
                  Address: {data.bmc.addresses.ip} ({data.bmc.addresses.type})
                </Typography>
                <Typography variant="h2" fontSize={16}>
                  Gateway: {data.bmc.addresses.gateway}
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
            <Card variant="outlined" sx={{ height: "190px" }}>
              <CardContent>
                <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                  Volumes
                </Typography>
                {data.storage.volumes.map((val, index) => (
                  <React.Fragment key={index}>
                    <Typography variant="h1" fontSize={16}>
                      Name: {val.name}
                    </Typography>
                    <Typography variant="h1" fontSize={14}>
                      Type: {val.volume_type} {val.raid_type}
                    </Typography>
                    <Typography variant="h1" fontSize={14} sx={{ marginBottom: "5px" }}>
                      Capacity: {val.capacity}
                    </Typography>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 xs={12} sm={6} lg={3}>
            <Card variant="outlined" sx={{ height: "190px" }}>
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
              <CardActions>
                <Button variant="outlined" size="small">
                  Show
                </Button>
                <Button variant="outlined" size="small">
                  Clear
                </Button>
              </CardActions>
            </Card>
          </Grid2>

          <Grid2 xs={12}>
            <Divider />
          </Grid2>

          {data.processor.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  {/* <CardMedia sx={{ height: "160px", marginBottom: "8px" }} image={intel_logo} /> */}
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    CPUs
                  </Typography>
                  {data.processor.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={16}>
                        {index + 1}: {val.model.split("@")[0]}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Cores: {val.cores}
                      </Typography>
                      {val.logical_proc === "Enabled" && (
                        <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                          Threads: {val.threads}
                        </Typography>
                      )}
                      {/* {val.turbo === "Enabled" && ( */}
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px" }}>
                        Frequency: {val.frequency} MHz
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px", marginBottom: "10px" }}>
                        Turbo Frequency: {val.max_frequency} MHz
                      </Typography>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}

          {data.gpu.gpus.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  {/* <CardMedia sx={{ height: "160px", marginBottom: "8px" }} image={nvidia_logo} /> */}
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    GPUs
                  </Typography>

                  <Typography variant="h2" fontSize={16} sx={{ marginBottom: "5px" }}>
                    SR-IOV: {data.gpu.vGPU ? "true" : "false"}
                  </Typography>
                  {data.gpu.gpus.map((val, index) => (
                    <Typography variant="h2" fontSize={16} sx={{ marginBottom: "10px" }} key={index}>
                      {index + 1}: {val.model}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}

          {data.pcie.length > 0 && (
            <Grid2 xs={12} sm={6} lg={3}>
              <Card variant="outlined" sx={{ height: "270px" }}>
                <CardContent>
                  {/* <CardMedia sx={{ height: "160px", marginBottom: "8px" }} image={nvidia_logo} /> */}
                  <Typography variant="h1" fontSize={22} sx={{ marginBottom: "10px" }}>
                    PCIe Devices
                  </Typography>
                  {data.pcie.map((val, index) => (
                    <React.Fragment key={index}>
                      <Typography variant="h2" fontSize={16}>
                        {index + 1}: {val.name}
                      </Typography>
                      <Typography variant="h2" fontSize={14} sx={{ textIndent: "20px", marginBottom: "10px" }}>
                        Manufacturer: {val.manufacturer}
                      </Typography>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
          )}
          <Grid2 xs={12} sm={6} lg={3}>
            <Card variant="outlined" sx={{ height: "270px" }}>
              <CardContent>
                <TableContainer>
                  <Table size="small" sx={{ tableLayout: "fixed", width: `${diskChassisArr.length * 40}px` }}>
                    <TableHead>
                      <TableRow>
                        {diskChassisArr.length > 0 &&
                          diskChassisArr.map((val, index) => (
                            <TableCell align="center" key={index}>
                              {index}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        {diskChassisArr.length > 0 &&
                          diskChassisArr.map((val, index) => (
                            <TableCell
                              key={index}
                              sx={{
                                border: 1,
                                borderColor: grey[300],
                                textOrientation: "mixed",
                                writingMode: "vertical-rl",
                              }}
                            >
                              {val.status !== "empty" && (
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <i
                                    className="bi bi-activity"
                                    style={{
                                      color: val.status === "OK" ? green[300] : orange[300],
                                      fontSize: "15px",
                                      marginBottom: "10px",
                                    }}
                                  />
                                  <Typography fontSize={14}>{val.name}</Typography>
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

          <Grid2 xs={12} sx={{ marginTop: "5px", marginBottom: "5px" }}>
            <Divider />
          </Grid2>
          {data.network.map((val, index) => (
            <Grid2 xs={12} sm={6} lg={3} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h1" fontSize={18}>
                    {val.id}
                  </Typography>
                  <Typography variant="h2" fontSize={16}>
                    Link: {val.link}
                  </Typography>
                  <Typography variant="h2" fontSize={16}>
                    Type: {val.type}
                  </Typography>
                  <Typography variant="h2" fontSize={16}>
                    MAC: {val.mac}
                  </Typography>
                  <Typography variant="h2" fontSize={16}>
                    Speed: {val.speed / 1000} Gb
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
        {/* <br />
        <TableContainer>
          <Table>
            <TableHead></TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Model:</TableCell>
                <TableCell align="right">{data.model}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manufacturer:</TableCell>
                <TableCell align="right">{data.manufacturer}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Service Tag:</TableCell>
                <TableCell align="right">{data.service_tag}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BIOS Version:</TableCell>
                <TableCell align="right">{data.bios_version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Boot Order:</TableCell>
                <TableCell align="right">{data.boot_order}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hostname:</TableCell>
                <TableCell align="right">{data.hostname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMC address:</TableCell>
                <TableCell align="right">
                  <CollapseTable display={data.bmc.addresses.ip}>
                    <TableRow>
                      <TableCell>Address:</TableCell>
                      <TableCell>{data.bmc.addresses.ip}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type:</TableCell>
                      <TableCell>{data.bmc.addresses.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gateway:</TableCell>
                      <TableCell>{data.bmc.addresses.gateway}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Subnet Mask:</TableCell>
                      <TableCell>{data.bmc.addresses.subnet_mask}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>VLAN:</TableCell>
                      <TableCell>{data.bmc.vlan}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>DNS:</TableCell>
                      <TableCell>{data.bmc.dns.join(", ")}</TableCell>
                    </TableRow>
                  </CollapseTable>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMC version:</TableCell>
                <TableCell align="right">{data.bmc.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory:</TableCell>
                <TableCell align="right">
                  {data.memory.size}, {data.memory.speed}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GPU Count:</TableCell>
                <TableCell align="right">
                  <CollapseTable display={data.gpu.physical}>
                    <TableRow>
                      <TableCell>Physical:</TableCell>
                      <TableCell>{data.gpu.physical}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Virtual:</TableCell>
                      <TableCell>{data.gpu.virtual}</TableCell>
                    </TableRow>
                    {data.gpu.gpus.map((val, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>Manufacturer:</TableCell>
                          <TableCell>{val.manufacturer}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Model:</TableCell>
                          <TableCell>{val.model}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </CollapseTable>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Volume Count:</TableCell>
                <TableCell align="right">
                  <CollapseTable display={data.storage.volumes.length}>
                    {data.storage.volumes.map((val, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>Name:</TableCell>
                          <TableCell>{val.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Description:</TableCell>
                          <TableCell>{val.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Volume Type:</TableCell>
                          <TableCell>{val.volume_type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>RAID Type:</TableCell>
                          <TableCell>{val.raid_type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capacity:</TableCell>
                          <TableCell>{val.capacity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </CollapseTable>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Drive Count:</TableCell>
                <TableCell align="right">
                  <CollapseTable display={data.storage.drives.length}>
                    {data.storage.drives.map((val, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>Slot:</TableCell>
                          <TableCell>{val.slot}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capacity:</TableCell>
                          <TableCell>{val.capacity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Type:</TableCell>
                          <TableCell>{val.type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Model:</TableCell>
                          <TableCell>{val.model}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Description:</TableCell>
                          <TableCell>{val.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Manufacturer:</TableCell>
                          <TableCell>{val.manufacturer}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Serial Number:</TableCell>
                          <TableCell>{val.serial_number}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Protocol:</TableCell>
                          <TableCell>{val.protocol}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Capable Speed:</TableCell>
                          <TableCell>{val.capable_speed}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Rotation Speed:</TableCell>
                          <TableCell>{val.rotation_speed}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Predicted Write Endurance:</TableCell>
                          <TableCell>{val.predicted_write_endurance}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Hotspare Type:</TableCell>
                          <TableCell>{val.hotspare_type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </CollapseTable>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SEL Count:</TableCell>
                <TableCell align="right">
                  <CollapseTable display={data.sel.logs.length}>
                    {data.sel.logs.map((val, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>Severity:</TableCell>
                          <TableCell>{val.severity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Timestamp:</TableCell>
                          <TableCell>{val.created}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Message:</TableCell>
                          <TableCell>{val.message}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </CollapseTable>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer> */}
      </Box>
    </>
  )
}

const CollapseTable = (props) => {
  const [expand, setExpand] = useState(false)
  return (
    <>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        {expand === false && <Typography>{props.display}</Typography>}
        <IconButton size="small" onClick={() => setExpand(!expand)}>
          {expand === false && <ExpandMoreIcon />}
          {expand === true && <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={expand}>
        <Table size="small">
          <TableBody>{props.children}</TableBody>
        </Table>
      </Collapse>
    </>
  )
}

export default Redfish
