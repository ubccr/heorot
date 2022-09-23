import { Box, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import Actions from "./components/Actions"
import BootImage from "./grendel/BootImage"
import Console from "./redfish/Console"
import Firmware from "./grendel/Firmware"
import Interfaces from "./grendel/Interfaces"
import NewGridC from "./components/NewGridC"
import Provision from "./grendel/Provision"
import Switches from "./components/Switches"
import TableC from "./components/TableC"
import Tags from "./grendel/Tags"
import { UserContext } from "../../contexts/UserContext"
import WarrantyDisplay from "./redfish/WarrantyDisplay"
import { apiConfig } from "../../config"
import { useParams } from "react-router-dom"
import { useSnackbar } from "notistack"

const Index = () => {
  const { node } = useParams()
  const [simple, setSimple] = useState(false)
  const [apiData, setApiData] = useState()
  const [refetch, setRefetch] = useState(false)
  const [BMC, setBMC] = useState("")
  const [user] = useContext(UserContext)

  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const types = ["swi", "swe", "pdu"]
    if (types.includes(node.substring(0, 3))) {
      setSimple(true)
    }
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(`${apiConfig.apiUrl}/client/node/${node}`, payload)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          let data = response.result[0]
          data.provision = response.result[0].provision.toString()
          if (data.tags === null) data.tags = []
          if (data.tags.includes("noAPI")) setSimple(true)
          data.interfaces.forEach((val, index) => {
            if (val.fqdn.substring(0, 3) === "bmc") setBMC(val.fqdn)
          })
          if (response.bmc === false) setSimple(true)

          setApiData(data)
          setLoading(false)
        } else {
          enqueueSnackbar(response.message, { variant: response.status })
        }
      })
  }, [refetch, node])

  return (
    <Box>
      {!loading && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: "26pt",
                textAlign: "center",
                marginBottom: "16px",
                padding: "10px",
                border: 1,
                borderRadius: "10px",
                borderColor: "border.main",
                bgcolor: "background.main",
                color: "text.primary",
                boxShadow: 16,
                width: "300px",
              }}
            >
              {node}
            </Typography>
          </Box>
          <Provision node={node} data={apiData.provision} refetch={refetch} setRefetch={setRefetch} />
          <Tags node={node} data={apiData.tags} refetch={refetch} setRefetch={setRefetch} />
          <NewGridC heading="Firmware:">
            <Box sx={{ textAlign: "end", marginRight: "10px" }}>
              <Firmware initialFirmware={apiData.firmware} node={node} />
            </Box>
          </NewGridC>
          <Interfaces data={apiData.interfaces} />
          <NewGridC heading="Boot Image:">
            <Box sx={{ textAlign: "end", marginRight: "10px" }}>
              <BootImage bootimage={apiData.boot_image} node={node} />
            </Box>
          </NewGridC>

          {node.substring(0, 3) === "swe" && <Switches node={node} />}

          {!simple && (
            <>
              <Console node={node} BMC={BMC} />

              <Actions node={node} />

              <WarrantyDisplay node={node} bmc={BMC} />

              <br />
              <TableC node={node} />
              <br />
            </>
          )}
        </>
      )}
    </Box>
  )
}

export default Index
