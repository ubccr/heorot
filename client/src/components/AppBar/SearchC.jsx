import { TextField, Autocomplete, CircularProgress, Box } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../contexts/UserContext"
import { apiPort } from "../../config"
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"

const SearchC = () => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState([])
  const loading = open && options.length === 0
  const user = useContext(UserContext)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    ;(async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      let query = await (
        await fetch(
          `https://${window.location.hostname}:${apiPort}/grendel/host/list`,
          payload
        )
      ).json()
      if (query.grendelResponse === "success" && active) {
        let nodes = []
        query.response.forEach((element) => {
          nodes.push({ name: element.name })
        })
        setOptions([...nodes])
      } else {
        enqueueSnackbar("Error loading nodes for Search", { variant: "error" })
      }
    })()

    return () => {
      active = false
    }
  }, [loading])

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  return (
    <Box
      sx={{
        width: 214,
        height: 54,
        marginRight: "20px",
        bgcolor: "background.main",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Autocomplete
        sx={{
          width: 200,
        }}
        size="small"
        open={open}
        onOpen={() => {
          setOpen(true)
        }}
        onClose={() => {
          setOpen(false)
        }}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        options={options}
        loading={loading}
        clearOnBlur={true}
        onChange={(event, value) => {
          if (value !== null) navigate(`/Node/${value.name}`)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress
                      color="inherit"
                      size={20}
                      sx={{ marginRight: 4 }}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  )
}
export default SearchC
