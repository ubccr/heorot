import { Button } from "@mui/material"
import { Box } from "@mui/system"

import { useState } from "react"
import NewGridC from "./NewGridC"
import AlertC from "../../components/AlertC"

const Provision = ({ node, data, refetch, setRefetch }) => {
  const [openAlert, setOpenAlert] = useState(false)
  const [message, setMessage] = useState("")
  const [color, setColor] = useState("success")

  const handleClick = async () => {
    let url = `http://${window.location.hostname}:3030/grendel/provision/${node}`
    if (data === "true")
      url = `http://${window.location.hostname}:3030/grendel/unprovision/${node}`

    let result = await (await fetch(url)).json()

    if (result.grendelResponse === "success" && result.response.hosts === 1) {
      setMessage(`${node} successfully updated`)
    } else {
      setColor("error")
      setMessage(
        `Node provision change Failed. Response: ${result.response.message}`
      )
    }
    setOpenAlert(!openAlert)
    setRefetch(!refetch)
  }

  return (
    <>
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
      <AlertC
        color={color}
        message={message}
        openAlert={openAlert}
        setOpenAlert={setOpenAlert}
      />
    </>
  )
}

export default Provision
