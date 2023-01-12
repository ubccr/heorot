import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { Controller, useForm } from "react-hook-form"

import CloseOutlined from "@mui/icons-material/CloseOutlined"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import React from "react"
import { useState } from "react"

const Grendel = ({ query }) => {
  const [default_values, setDefault_values] = useState({
    provision: query.data.result.provision,
    firmware: query.data.result.firmware,
    boot_image: query.data.result.boot_image,
    tags: query.data.result.tags.join(", "),
    interfaces: query.data.result.interfaces.map((val) => {
      return {
        mac: val.mac,
        ip: val.ip,
        ifname: val.ifname,
        fqdn: val.fqdn,
        bmc: val.bmc,
        vlan: val.vlan,
      }
    }),
  })

  const { control, unregister, handleSubmit } = useForm({
    defaultValues: default_values,
  })
  const onSubmit = (data) => {
    console.log(data)
  }
  console.log(query.data)
  console.log(default_values)
  return (
    <TableContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="right">
                <Button variant="outlined" size="small" type="submit">
                  Submit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    setDefault_values({
                      ...default_values,
                      interfaces: [
                        ...default_values.interfaces,
                        {
                          mac: "",
                          ip: "",
                          ifname: "",
                          fqdn: "",
                          bmc: false,
                          vlan: "",
                        },
                      ],
                    })
                  }}
                >
                  Add Interface
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>ID:</TableCell>
              <TableCell align="right">{query.data.result.id}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Provision:</TableCell>
              <TableCell align="right">
                <Controller
                  name="provision"
                  control={control}
                  render={({ field }) => <Checkbox {...field} checked={field.value} />}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Tags:</TableCell>
              <TableCell align="right">
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => <TextField size="small" {...field} />}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Boot Image:</TableCell>
              <TableCell align="right">
                <Controller
                  name="boot_image"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <Select {...field} variant="outlined" size="small">
                        {query.data.boot_image_options.map((val, index) => (
                          <MenuItem key={index} value={val.name}>
                            {val.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Firmware:</TableCell>
              <TableCell align="right">
                <Controller
                  name="firmware"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <Select {...field} variant="outlined" size="small">
                        {query.data.firmware_options.map((val, index) => (
                          <MenuItem key={index} value={val}>
                            {val}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </TableCell>
            </TableRow>

            {default_values.interfaces.map((val, index) => (
              <TableRow key={index}>
                <TableCell>Interface {index + 1}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box>
                      <Interfaces data={val} index={index} control={control} />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // FIXME:
                        unregister(`interfaces[${index}]`)
                        let tmp = default_values
                        tmp.interfaces.splice(index, 1)
                        setDefault_values({ ...tmp })
                      }}
                    >
                      <CloseOutlined />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
    </TableContainer>
  )
}

const Interfaces = ({ data, index, control }) => {
  const [expand, setExpand] = useState(false)
  let shortDisplay = data.fqdn !== "" ? data.fqdn : data.ip
  return (
    <>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        {expand === false && <Typography>{shortDisplay}</Typography>}
        <IconButton size="small" onClick={() => setExpand(!expand)}>
          {expand === false && <ExpandMoreIcon />}
          {expand === true && <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={expand}>
        <Box sx={{ display: "flex", justifyContent: "right" }}>
          <Table size="small" sx={{ maxWidth: "600px" }}>
            <TableBody>
              <TableRow>
                <TableCell>Name:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.ifname`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FQDN:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.fqdn`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>IP:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.ip`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>MAC:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.mac`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>VLAN:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.vlan`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>MTU:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.mtu`}
                    control={control}
                    defaultValue={""}
                    render={({ field }) => <TextField size="small" {...field} fullWidth />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMC:</TableCell>
                <TableCell>
                  <Controller
                    name={`interfaces.${index}.bmc`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => <Checkbox {...field} checked={field.value} />}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Collapse>
    </>
  )
}

export default Grendel
