import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import { Controller, useFieldArray, useForm } from "react-hook-form"
import React, { useEffect } from "react"

import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined"
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined"
import CloseOutlined from "@mui/icons-material/CloseOutlined"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useState } from "react"

const Grendel = ({ query }) => {
  const [tagRef] = useAutoAnimate(null)
  const [tagExpand, setTagExpand] = useState(false)
  const [newTag, setNewTag] = useState("")

  const { control, handleSubmit } = useForm({
    defaultValues: {
      provision: query.data.result.provision,
      firmware: query.data.result.firmware,
      boot_image: query.data.result.boot_image,
      tags: query.data.result.tags.join(", "),
    },
  })

  const {
    fields: interface_fields,
    append: interface_append,
    remove: interface_remove,
  } = useFieldArray({
    control,
    name: "interfaces",
  })
  const {
    fields: tag_fields,
    append: tag_append,
    remove: tag_remove,
  } = useFieldArray({
    control,
    name: "tags",
  })

  useEffect(() => {
    interface_remove()
    tag_remove()
    query.data.result.interfaces.forEach((val) => {
      interface_append({
        mac: val.mac,
        ip: val.ip,
        ifname: val.ifname,
        fqdn: val.fqdn,
        bmc: val.bmc,
        vlan: val.vlan,
      })
    })
    query.data.result.tags.forEach((val) => {
      tag_append({
        tag: val,
      })
    })
  }, [query])

  const onSubmit = (data) => {
    console.log(data)
  }
  return (
    <TableContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Table size="small">
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
                  onClick={() => {
                    interface_append({
                      mac: "",
                      ip: "",
                      ifname: "",
                      fqdn: "",
                      bmc: false,
                      vlan: "",
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
                <Box sx={{ display: "inline-flex", gap: "4px", alignItems: "center" }} ref={tagRef}>
                  {tag_fields.map((item, index) => (
                    <Chip key={item.id} label={tag_fields[index].tag} onDelete={() => tag_remove(index)} />
                  ))}
                  <Collapse in={tagExpand} unmountOnExit>
                    <TextField
                      sx={{ width: "80px" }}
                      size="small"
                      placeholder="z01"
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <IconButton onClick={() => tag_append({ tag: newTag })}>
                      <AddOutlinedIcon />
                    </IconButton>
                  </Collapse>
                  <IconButton size="small" onClick={() => setTagExpand(!tagExpand)}>
                    {tagExpand === false && <ChevronLeftOutlinedIcon />}
                    {tagExpand === true && <ChevronRightOutlinedIcon />}
                  </IconButton>
                </Box>
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

            {interface_fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>Interface {index + 1}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box>
                      <Interfaces data={item} index={index} control={control} />
                    </Box>
                    <IconButton size="small" onClick={() => interface_remove(index)}>
                      <CloseOutlined />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

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

            <TableRow>
              <TableCell>ID:</TableCell>
              <TableCell align="right">{query.data.result.id}</TableCell>
            </TableRow>
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
