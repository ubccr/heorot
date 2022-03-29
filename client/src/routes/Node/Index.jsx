import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Alert, Box, Button, Grid, Snackbar, Typography } from "@mui/material"

import GridC from "./GridC"
import AccordianC from "./AccordianC"
import Interfaces from "./Interfaces"
import TableC from "./TableC"
import WarrantyDisplay from "./WarrantyDisplay"
import Provision from "./Provision"
import Tags from "./Tags"
import Console from "./Console"

const Index = () => {
  const { node } = useParams()
  const [apiData, setApiData] = useState()
  const [refetch, setRefetch] = useState(false)
  const [BMC, setBMC] = useState("")

  const [loading, setLoading] = useState(true)
  const [openSEL, setOpenSEL] = useState(false)
  const [messageSEL, setMessageSEL] = useState({
    status: "",
    message: "",
    color: "info",
  })

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/node/${node}`)
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
        }
      })
  }, [refetch])

  const handleClearSEL = () => {
    let bmc = null
    apiData.interfaces.forEach((val, index) => {
      if (val.fqdn.substring(0, 3) === "bmc") bmc = val.fqdn
    })
    fetch(
      `http://${window.location.hostname}:3030/redfish/actions/clearSEL/${bmc}`
    )
      .then((res) => res.json())
      .then((result) => {
        setMessageSEL(result)
        setOpenSEL(true)
      })
  }

  const handleSELSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setOpenSEL(false)
  }

  const handleResetBMC = () => {
    fetch(
      `http://${window.location.hostname}:3030/redfish/actions/resetBMC/${BMC}`
    )
      .then((res) => res.json())
      .then((result) => {
        setMessageSEL(result)
        setOpenSEL(true)
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
          <GridC heading="Firmware:" data={apiData.firmware} />
          <Interfaces data={apiData.interfaces} />
          <GridC heading="Boot Image:" data={apiData.boot_image} />
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
              height: 60,
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

          <Snackbar
            open={openSEL}
            autoHideDuration={4000}
            onClose={handleSELSnackbarClose}
          >
            <Alert severity={messageSEL.color} onClose={handleSELSnackbarClose}>
              {messageSEL.message}
            </Alert>
          </Snackbar>

          <br />
          <TableC node={node} />
          <br />
        </>
      )}
    </Box>
  )
}

export default Index
