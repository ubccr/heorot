import { Box, Button, Checkbox, CircularProgress, FormControlLabel, TextField, Typography } from "@mui/material"
import { Controller, useForm } from "react-hook-form"

import BgContainer from "../../components/BgContainer"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Header from "../../components/Header"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useContext } from "react"
import { useMutation } from "react-query"
import { useSnackbar } from "notistack"

const Warranty = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [user] = useContext(UserContext)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tags: "",
      refresh: false,
    },
  })

  const onSubmit = (data) => {
    // data.preventDefault()
    let tags = data.tags.split(",").map((tag) => tag.trim())
    mutation.mutate({
      tags,
      refresh: data.refresh,
    })
  }
  const mutation = useMutation({
    mutationFn: (data) => {
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
      return fetch(`${apiConfig.apiUrl}/warranty/v1/add`, payload)
    },
    onError: async (error, variables, context) => {
      let error_json = await error.json()
      enqueueSnackbar(error_json.message, { variant: "error" })
      console.error(error_json.error)
    },
    onSuccess: async (data, variables, context) => {
      let data_json = await data.json()
      enqueueSnackbar(data_json.message, { variant: "success" })
    },
  })

  return (
    <Box>
      <Header header="Warranty" />
      <BgContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid2 container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Grid2 item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Typography variant="h2" sx={{ fontSize: "20pt", margin: "10px" }}>
                Enter grendel tag(s) of nodes to query Dell's Warranty API:
              </Typography>
            </Grid2>
            <Grid2 item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth {...field} size="small" label="Tags" placeholder="z01, gpu" />
                )}
              />
            </Grid2>
            <Grid2 item xs={12} sm={3} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Controller
                name="refresh"
                control={control}
                render={({ field }) => (
                  <FormControlLabel label="Refresh" control={<Checkbox {...field} checked={field.value} />} />
                )}
              />
            </Grid2>
            <Grid2 item xs={12} sm={3} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Button type="submit" variant="outlined">
                {mutation.status === "loading" ? <CircularProgress size={22.75} /> : "Submit"}
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </BgContainer>
    </Box>
  )
}

export default Warranty
