import { CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material"

import React from "react"
import { UserContext } from "../contexts/UserContext"
import { apiConfig } from "../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const QueryTextfield = ({ label, endpoint, index, dataIndex = null, value, setValue }) => {
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["queryTextfield", index],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}${endpoint}`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )
  return (
    <FormControl fullWidth size="small">
      <InputLabel>
        {label} {query.isLoading && <CircularProgress color="primary" size={15} />}
      </InputLabel>
      <Select
        value={value[index]}
        onOpen={() => query.refetch()}
        label={label}
        onChange={(e) => setValue({ ...value, [index]: e.target.value })}
        variant="outlined"
        size="small"
      >
        {query.isFetched &&
          query.data.status === "success" &&
          query.data.result.map((val, index) => {
            let output = dataIndex === null ? val : val[dataIndex]
            return (
              <MenuItem value={output} key={index}>
                {output}
              </MenuItem>
            )
          })}
      </Select>
    </FormControl>
  )
}

export default QueryTextfield
