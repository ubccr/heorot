import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  FormControlLabel,
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
} from "@mui/material"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import React, { useContext, useEffect } from "react"

import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined"
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined"
import CloseOutlined from "@mui/icons-material/CloseOutlined"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import LaunchIcon from "@mui/icons-material/Launch"
import { TransitionGroup } from "react-transition-group"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useSnackbar } from "notistack"
import { useState } from "react"

// TODO: Breakup file for readability
// TODO: Form validation & error handling
// TODO: Form submission
// TODO: Fix tags animation pop on component load
// TODO: Verify useEffect usage

const Grendel = ({ query }) => {
  // query
  const { enqueueSnackbar } = useSnackbar()
  const [user] = useContext(UserContext)

  // tags
  const [tagExpand, setTagExpand] = useState(false)
  const [newTag, setNewTag] = useState("")

  //  boot image
  const [imageExpand, setImageExpand] = useState(false)

  // form
  const { control, reset, getValues, setValue, watch, handleSubmit } = useForm({
    defaultValues: {
      provision: query.data.result.provision,
      firmware: query.data.result.firmware,
      boot_image: query.data.result.boot_image,
      id: query.data.result.id,
      name: query.data.result.name,
      boot_image_edit: JSON.stringify(
        [query.data.boot_image_options.find((val) => val.name === query.data.result.boot_image)],
        null,
        4
      ),
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

  useEffect(() => {
    let boot_image = getValues("boot_image")
    let newImageJson =
      boot_image === ""
        ? ""
        : JSON.stringify([query.data.boot_image_options.find((val) => val.name === getValues("boot_image"))], null, 4)
    setValue("boot_image_edit", newImageJson)
  }, [watch("boot_image")])

  const resetForm = () => {
    reset({
      provision: query.data.result.provision,
      firmware: query.data.result.firmware,
      boot_image: query.data.result.boot_image,
      id: query.data.result.id,
      name: query.data.result.name,
      boot_image_edit: JSON.stringify(
        [query.data.boot_image_options.find((val) => val.name === query.data.result.boot_image)],
        null,
        4
      ),
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
  const [imageLoading, setImageLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    let tmp_tags = data.tags.map((val) => val.tag)
    let final_data = [{ ...data, tags: tmp_tags }]
    delete final_data.boot_image_edit

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

  const onImageSubmit = async () => {
    setImageLoading(true)
    let payload = {
      method: "POST",
      headers: {
        "x-access-token": user.accessToken,
        "Content-Type": "application/json",
      },
      body: getValues("boot_image_edit"),
    }
    let res = await (await fetch(`${apiConfig.apiUrl}/grendel/image`, payload)).json()
    setImageLoading(false)
    if (res.status === "success") {
      enqueueSnackbar(`Successfully updated ${res.result.images} image(s)`, { variant: res.status })
      query.refetch()
    } else {
      console.error(res)
      enqueueSnackbar(res.message, { variant: res.status })
    }
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
                <Box sx={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "end" }}>
                  <Box sx={{ display: "flex", gap: "4px", justifyContent: "end", flexWrap: "wrap" }}>
                    {tag_fields.map((item, index) => (
                      <Chip
                        key={item.id}
                        label={tag_fields[index].tag}
                        size="small"
                        onDelete={() => tag_remove(index)}
                      />
                    ))}
                  </Box>
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

            <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
              <TableCell>Boot Image:</TableCell>
              <TableCell align="right">
                <Box sx={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
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
                            <MenuItem key={index} value={val.name}>
                              {val.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Collapse in={imageExpand} orientation="horizontal" timeout={500}>
                    <Box sx={{ display: "inline-flex" }}>
                      <Button variant="outlined" onClick={() => onImageSubmit()}>
                        {imageLoading ? <CircularProgress size={22.75} /> : "Submit"}
                      </Button>
                    </Box>
                  </Collapse>
                  <IconButton size="small" onClick={() => setImageExpand(!imageExpand)}>
                    {imageExpand ? <ChevronRightOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} style={{ paddingBottom: 0, paddingTop: 0 }}>
                <Collapse in={imageExpand} unmountOnExit timeout={500}>
                  <Controller
                    name="boot_image_edit"
                    control={control}
                    render={({ field }) => <TextField multiline rows={16} fullWidth {...field} label="Boot Image" />}
                  />
                </Collapse>
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

            <TableRow>
              <TableCell colSpan={2} sx={{ overflow: "hidden", paddingTop: "10px", paddingBottom: "10px" }}>
                <Grid2 container spacing={2} sx={{ display: "flex", justifyContent: "end" }}>
                  {interface_fields.map((item, index) => (
                    <Grid2 key={item.id} xs={12} sm={12} md={6}>
                      <Grid2
                        container
                        spacing={1}
                        sx={{
                          border: 1,
                          borderColor: "border.main",
                          borderRadius: "5px",
                          padding: "16px",
                          paddingTop: "10px",
                        }}
                      >
                        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
                          <Controller
                            name={`interfaces.${index}.bmc`}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel label="BMC" control={<Checkbox {...field} checked={field.value} />} />
                            )}
                          />
                        </Grid2>
                        <Grid2 xs={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                          {watch(`interfaces.${index}.bmc`) === true && (
                            <IconButton
                              size="small"
                              sx={{ maxHeight: "34px" }}
                              onClick={() => window.open(`https://${watch(`interfaces.${index}.fqdn`)}`)}
                            >
                              <LaunchIcon />
                            </IconButton>
                          )}
                          <IconButton size="small" sx={{ maxHeight: "34px" }} onClick={() => interface_remove(index)}>
                            <CloseOutlined />
                          </IconButton>
                        </Grid2>
                        <Grid2 xs={12}>
                          <Controller
                            name={`interfaces.${index}.fqdn`}
                            control={control}
                            render={({ field }) => <TextField label="FQDN" size="small" {...field} fullWidth />}
                          />
                        </Grid2>
                        <Grid2 xs={12}>
                          <Controller
                            name={`interfaces.${index}.mac`}
                            control={control}
                            render={({ field }) => <TextField label="MAC" size="small" {...field} fullWidth />}
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
                      </Grid2>
                    </Grid2>
                  ))}
                </Grid2>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </form>
    </TableContainer>
  )
}

export default Grendel
