import { Button } from "@mui/material"
import { Box } from "@mui/system"

import { useSnackbar } from "notistack"
import NewGridC from "./NewGridC"

const Provision = ({ node, data, refetch, setRefetch }) => {
  const { enqueueSnackbar } = useSnackbar()

  const handleClick = async () => {
    let url = `http://${window.location.hostname}:3030/grendel/provision/${node}`
    if (data === "true")
      url = `http://${window.location.hostname}:3030/grendel/unprovision/${node}`

    let result = await (await fetch(url)).json()

    if (result.grendelResponse === "success" && result.response.hosts === 1) {
      enqueueSnackbar(`${node} successfully updated`, { variant: "success" })
    } else {
      enqueueSnackbar(
        `Node provision change error. Response: ${result.response.message}`,
        { variant: "error" }
      )
    }
    setRefetch(!refetch)
  }

  return (
    <NewGridC heading="Provision:">
      <Box sx={{ textAlign: "end" }}>
        {data}
        <Button
          variant="outlined"
          sx={{ marginLeft: "20px" }}
          onClick={handleClick}
        >
          Toggle
        </Button>
      </Box>
    </NewGridC>
  )
}

export default Provision
