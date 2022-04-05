import { useParams } from "react-router-dom"
import { useEffect, useState, useContext } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import { useSnackbar } from "notistack"
import { UserContext } from "../../contexts/UserContext"

import Interfaces from "./grendel/Interfaces"
import TableC from "./components/TableC"
import WarrantyDisplay from "./redfish/WarrantyDisplay"
import Provision from "./grendel/Provision"
import Tags from "./grendel/Tags"
import Console from "./redfish/Console"
import NewGridC from "./components/NewGridC"
import { apiPort } from "../../config"

const Index = () => {
  const { node } = useParams()
  const [simple, setSimple] = useState(false)
  const [apiData, setApiData] = useState()
  const [refetch, setRefetch] = useState(false)
  const [BMC, setBMC] = useState("")
  const [user, setUser] = useContext(UserContext)

  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const types = ["swi", "swe", "pdu"]
    if (!types.includes(node.substring(0, 3))) {
      setSimple(true)
    }
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(
      `https://${window.location.hostname}:${apiPort}/client/node/${node}`,
      payload
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          let data = response.result[0]
          data.provision = response.result[0].provision.toString()

          data.interfaces.forEach((val, index) => {
            if (val.fqdn.substring(0, 3) === "bmc") setBMC(val.fqdn)
          })
          setApiData(data)
          setLoading(false)
        } else {
          enqueueSnackbar(response.message, { variant: response.status })
        }
      })
  }, [refetch, node])

  const handleClearSEL = () => {
    let bmc = null
    apiData.interfaces.forEach((val, index) => {
      if (val.fqdn.substring(0, 3) === "bmc") bmc = val.fqdn
    })
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(
      `https://${window.location.hostname}:${apiPort}/redfish/actions/clearSEL/${bmc}`,
      payload
    )
      .then((res) => res.json())
      .then((result) => {
        enqueueSnackbar(result.message, { variant: result.color })
      })
  }

  const handleResetBMC = () => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(
      `https://${window.location.hostname}:${apiPort}/redfish/actions/resetBMC/${BMC}`,
      payload
    )
      .then((res) => res.json())
      .then((result) => {
        enqueueSnackbar(result.message, { variant: result.color })
      })
  }

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
          <Provision
            node={node}
            data={apiData.provision}
            refetch={refetch}
            setRefetch={setRefetch}
          />
          <Tags
            node={node}
            data={apiData.tags}
            refetch={refetch}
            setRefetch={setRefetch}
          />
          <NewGridC heading="Firmware:">
            <Box sx={{ textAlign: "end", marginRight: "10px" }}>
              {apiData.firmware}
            </Box>
          </NewGridC>
          <Interfaces data={apiData.interfaces} />
          <NewGridC heading="Boot Image:">
            <Box sx={{ textAlign: "end", marginRight: "10px" }}>
              {apiData.boot_image}
            </Box>
          </NewGridC>

          {simple && (
            <>
              <Console node={node} BMC={BMC} />

              <Grid
                container
                sx={{
                  overflow: "hidden",
                  padding: "10px",
                  marginTop: "12px",
                  alignItems: "center",
                  border: 1,
                  borderRadius: "10px",
                  borderColor: "border.main",
                  bgcolor: "background.main",
                  color: "text.primary",
                  boxShadow: 12,
                  minHeight: 60,
                }}
              >
                <Grid item xs>
                  <Typography
                    variant="h2"
                    sx={{ fontSize: "18pt", paddingLeft: 2 }}
                  >
                    Actions:
                  </Typography>
                </Grid>

                <Grid item xs sx={{ textAlign: "center", textAlign: "end" }}>
                  <Button variant="outlined" onClick={handleClearSEL}>
                    Clear SEL
                  </Button>{" "}
                  <Button variant="outlined" onClick={handleResetBMC}>
                    Reset BMC
                  </Button>
                </Grid>
              </Grid>

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
