import { Button } from "@mui/material"
import { Box } from "@mui/system"

import { useSnackbar } from "notistack"
import NewGridC from "../components/NewGridC"
import { UserContext } from "../../../contexts/UserContext"
import { useContext } from "react"

const Provision = ({ node, data, refetch, setRefetch }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useContext(UserContext)

  const handleClick = async () => {
    let url = `https://${window.location.hostname}:443/grendel/provision/${node}`
    if (data === "true")
      url = `https://${window.location.hostname}:443/grendel/unprovision/${node}`
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    let result = await (await fetch(url, payload)).json()

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
