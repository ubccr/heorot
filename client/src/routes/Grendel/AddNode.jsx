import { Box, Button, FormGroup, Step, StepButton, Stepper } from "@mui/material"

import ConfigureInterfaces from "./AddNode/ConfigureInterfaces"
import NodeOptions from "./AddNode/NodeOptions"
import ReviewNode from "./AddNode/ReviewNode"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"
import { useState } from "react"

const AddNode = () => {
  const [stepperRef] = useAutoAnimate(null)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const initialOptions = {
    name: "",
    firmware: "",
    boot_image: "",
    provision: true,
    tags: [],
  }

  const [step, setStep] = useState(0)
  const [ifaces, setIfaces] = useState([])
  const [options, setOptions] = useState(initialOptions)
  const newIface = { name: "", fqdn: "", ip: "", mac: "", bmc: false, vlan: "1", mtu: 1500 }

  const addNodeQuery = useQuery(
    "addNode",
    async ({ signal }) => {
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            ...options,
            interfaces: ifaces,
          },
        ]),
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/grendel/host`, payload)).json()
      if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
      else if (res.status === "success")
        enqueueSnackbar(`Successfully added ${res.result.hosts} host`, { variant: "success" })
      return res
    },
    { enabled: false }
  )

  return (
    <FormGroup>
      <Box>
        <Box
          sx={{
            marginBottom: "30px",
            width: "100%",
            marginTop: "15px",
          }}
        >
          <Stepper nonLinear activeStep={step}>
            <Step key={0}>
              <StepButton onClick={() => setStep(0)}>Node Options</StepButton>
            </Step>
            <Step key={1}>
              <StepButton onClick={() => setStep(1)}>Configure Interfaces</StepButton>
            </Step>
            <Step key={2}>
              <StepButton onClick={() => setStep(2)}>Review Node</StepButton>
            </Step>
          </Stepper>
        </Box>
        <Box sx={{ display: "flex", paddingLeft: "40px", paddingRight: "40px" }}>
          <Button onClick={() => setStep(step - 1)} disabled={step === 0 ? true : false} variant="outlined">
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }}></Box>
          {step === 1 && (
            <Button onClick={() => setIfaces([...ifaces, newIface])} variant="outlined" sx={{ marginRight: "5px" }}>
              Add Interface
            </Button>
          )}
          {step < 2 && (
            <Button onClick={() => setStep(step + 1)} variant="outlined">
              Next
            </Button>
          )}
          {step >= 2 && (
            <>
              <Button
                onClick={() => {
                  setOptions(initialOptions)
                  setIfaces([])
                }}
                variant="outlined"
                color="warning"
                sx={{ marginRight: "5px" }}
              >
                Clear Form
              </Button>
              <Button
                onClick={() => {
                  addNodeQuery.refetch()
                }}
                variant="outlined"
              >
                Import Node
              </Button>
            </>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ margin: "20px" }} ref={stepperRef}>
          {step === 0 && <NodeOptions options={options} setOptions={setOptions} />}
          {step === 1 && <ConfigureInterfaces ifaces={ifaces} setIfaces={setIfaces} />}
          {step === 2 && <ReviewNode options={options} ifaces={ifaces} />}
        </Box>

        {/* Footer */}
      </Box>
    </FormGroup>
  )
}

export default AddNode
