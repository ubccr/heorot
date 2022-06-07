import { Button } from "@mui/material"
import { Box } from "@mui/system"

import { useSnackbar } from "notistack"
import NewGridC from "../components/NewGridC"
import { UserContext } from "../../../contexts/UserContext"
import { useContext } from "react"
import { apiConfig } from "../../../config"

const Provision = ({ node, data, refetch, setRefetch }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useContext(UserContext)

  const handleClick = async () => {
    let url = `${apiConfig.apiUrl}/grendel/provision/${node}`
    if (data === "true") url = `${apiConfig.apiUrl}/grendel/unprovision/${node}`
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    let response = await (await fetch(url, payload)).json()

    if (response.status === "success" && response.result.hosts === 1) {
      enqueueSnackbar(`${node} successfully updated`, { variant: "success" })
    } else {
      enqueueSnackbar(
        `Node provision change error. Response: ${response.result.message}`,
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
