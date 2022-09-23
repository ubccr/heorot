import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"

const SearchC = ({ action, setOutput }) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState([])
  const loading = open && options.length === 0
  const [user] = useContext(UserContext)
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
        allowUnauthorized: true,
      }
      let query = await (await fetch(`${apiConfig.apiUrl}/grendel/host/list`, payload)).json()
      if (query.status === "success" && active) {
        let nodes = []
        query.result.forEach((element) => {
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
        autoHighlight
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        options={options}
        loading={loading}
        clearOnBlur={true}
        onChange={(event, value) => {
          if (action === "value") {
            if (value === null) setOutput("")
            else setOutput(value.name)
          } else if (value !== null) {
            navigate(`/Node/${value.name}`)
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} sx={{ marginRight: 4 }} /> : null}
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
