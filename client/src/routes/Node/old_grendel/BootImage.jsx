import { FormControl, MenuItem, Select } from "@mui/material"
import { useContext, useState } from "react"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const BootImage = ({ bootimage, node }) => {
  const [image, setImage] = useState(bootimage)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery("image", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (
      await fetch(`${apiConfig.apiUrl}/grendel/image/list`, payload)
    ).json()
    if (res.status === "error")
      enqueueSnackbar(res.message, { variant: "error" })
    return res
  })

  const setQuery = useQuery(
    ["setImage", image],
    async ({ signal }) => {
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodeset: node,
          action: "image",
          value: image,
        }),
        signal,
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/grendel/edit`, payload)
      ).json()
      if (res.status === "success")
        enqueueSnackbar(`Successfully edited ${res.result.hosts} host(s)`, {
          variant: "success",
        })
      else if (res.status === "error")
        enqueueSnackbar(res.message, { variant: "error" })
      return res
    },
    { enabled: false }
  )
  const handleChange = (e) => {
    setImage(e.target.value)
    // refetching without a delay causes the old image value to be used
    delay(50).then(() => {
      setQuery.refetch()
    })
  }
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
  return (
    <FormControl>
      {query.isFetched && query.data.status === "success" && (
        <Select
          value={image}
          onChange={handleChange}
          variant="outlined"
          size="small"
        >
          {query.data.result.map((val, index) => {
            return (
              <MenuItem value={val.name} key={index}>
                {val.name}
              </MenuItem>
            )
          })}
        </Select>
      )}
    </FormControl>
  )
}

export default BootImage
