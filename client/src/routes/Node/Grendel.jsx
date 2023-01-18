import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Fade,
  FormControl,
  FormControlLabel,
  Grow,
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
import React, { useContext, useEffect } from "react"

import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined"
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined"
import CloseOutlined from "@mui/icons-material/CloseOutlined"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { TransitionGroup } from "react-transition-group"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useSnackbar } from "notistack"
import { useState } from "react"

// TODO: Breakup file for readability
// TODO: Form validation & error handling
// TODO: Form submission
// TODO: Fix tags animation pop on component load

const Grendel = ({ query }) => {
  // query
  const { enqueueSnackbar } = useSnackbar()
  const [user] = useContext(UserContext)

  // tags
  const [tagExpand, setTagExpand] = useState(false)
  const [newTag, setNewTag] = useState("")

  // form
  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      provision: query.data.result.provision,
      firmware: query.data.result.firmware,
      boot_image: query.data.result.boot_image,
      id: query.data.result.id,
      name: query.data.result.name,
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
    resetForm()
  }, [query])

  const resetForm = () => {
    reset({
      provision: query.data.result.provision,
      firmware: query.data.result.firmware,
      boot_image: query.data.result.boot_image,
      id: query.data.result.id,
      name: query.data.result.name,
    })
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
        mtu: val.mtu,
      })
    })
    query.data.result.tags.forEach((val) => {
      tag_append({
        tag: val,
      })
    })
  }

  // query
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    let tmp_tags = data.tags.map((val) => val.tag)
    let final_data = [{ ...data, tags: tmp_tags }]

    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(final_data),
    }
    let res = await (await fetch(`${apiConfig.apiUrl}/grendel/host`, payload)).json()
    setLoading(false)
    if (res.status === "success")
      enqueueSnackbar(`Successfully updated ${res.result.hosts} host(s)`, { variant: res.status })
    else enqueueSnackbar(res.message, { variant: res.status })
    query.refetch()
  }

  return (
    <TableContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Box sx={{ display: "flex", gap: "4px", justifyContent: "end" }}>
                  <Button variant="outlined" size="small" type="submit">
                    {loading ? <CircularProgress size={22.75} /> : "Submit"}
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
                  <Button variant="outlined" size="small" color="warning" onClick={() => resetForm()}>
                    Reset
                  </Button>
                </Box>
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
                <Box sx={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                  <TransitionGroup>
                    {tag_fields.map((item, index) => (
                      <Collapse
                        key={item.id}
                        sx={{ display: "inline-flex", alignItems: "center", marginLeft: "2px", marginRight: "2px" }}
                        orientation="horizontal"
                        timeout={500}
                      >
                        <Chip label={tag_fields[index].tag} size="small" onDelete={() => tag_remove(index)} />
                      </Collapse>
                    ))}
                  </TransitionGroup>
                  <Collapse in={tagExpand} orientation="horizontal" timeout={500}>
                    <Box sx={{ display: "inline-flex" }}>
                      <TextField
                        sx={{ width: "90px" }}
                        size="small"
                        placeholder="z01"
                        label="New Tag"
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <IconButton onClick={() => tag_append({ tag: newTag })}>
                        <AddOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Collapse>
                  <IconButton size="small" onClick={() => setTagExpand(!tagExpand)}>
                    {tagExpand ? <ChevronRightOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
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
                      <Select
                        {...field}
                        variant="outlined"
                        size="small"
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {query.data.boot_image_options.map((val, index) => (
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

            {interface_fields.map((item, index) => (
              <Fade in={true} key={item.id}>
                <TableRow>
                  <TableCell>Interface {index + 1}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Box>
                        <Interfaces data={item} index={index} control={control} />
                      </Box>
                      <IconButton size="small" sx={{ maxHeight: "34px" }} onClick={() => interface_remove(index)}>
                        <CloseOutlined />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}

            <TableRow>
              <TableCell>Firmware:</TableCell>
              <TableCell align="right">
                <Controller
                  name="firmware"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <Select
                        {...field}
                        variant="outlined"
                        size="small"
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
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
          </TableBody>
        </Table>
      </form>
    </TableContainer>
  )
}

const Interfaces = ({ data, index, control }) => {
  const [expand, setExpand] = useState(false)
  let shortDisplay = data.fqdn !== "" ? data.fqdn.split(".")[0] : data.ip
  return (
    <>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        <Grow in={!expand}>
          {data.bmc === true ? (
            <Typography
              component="a"
              target="_blank"
              rel="noreferrer"
              href={`https://${data.fqdn}`}
              color="primary"
              sx={{ textDecoration: "underline" }}
            >
              {shortDisplay}
            </Typography>
          ) : (
            <Typography>{shortDisplay}</Typography>
          )}
        </Grow>
        <IconButton size="small" onClick={() => setExpand(!expand)}>
          {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expand} timeout={500}>
        <Grid2 container spacing={2} sx={{ maxWidth: "400px", marginTop: "2px" }}>
          <Grid2 xs={12}>
            <Controller
              name={`interfaces.${index}.fqdn`}
              control={control}
              render={({ field }) => <TextField label="FQDN" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Controller
              name={`interfaces.${index}.ifname`}
              control={control}
              render={({ field }) => <TextField label="Name" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Controller
              name={`interfaces.${index}.ip`}
              control={control}
              render={({ field }) => <TextField label="IP" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Controller
              name={`interfaces.${index}.mac`}
              control={control}
              render={({ field }) => <TextField label="MAC" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Controller
              name={`interfaces.${index}.vlan`}
              control={control}
              render={({ field }) => <TextField label="VLAN" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Controller
              name={`interfaces.${index}.mtu`}
              control={control}
              render={({ field }) => <TextField label="MTU" size="small" {...field} fullWidth />}
            />
          </Grid2>
          <Grid2 xs={12} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
            <Controller
              name={`interfaces.${index}.bmc`}
              control={control}
              render={({ field }) => (
                <FormControlLabel label="BMC" control={<Checkbox {...field} checked={field.value} />} />
              )}
            />
          </Grid2>
        </Grid2>
        {/* <Box sx={{ display: "flex", justifyContent: "right" }}>
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
        </Box> */}
      </Collapse>
    </>
  )
}

export default Grendel
