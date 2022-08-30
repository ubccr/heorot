import { Box, Button, FormGroup, Step, StepButton, Stepper } from "@mui/material"

import ConfigureInterfaces from "./AddNode/ConfigureInterfaces"
import NodeOptions from "./AddNode/NodeOptions"
import { useState } from "react"

const AddNode = () => {
  const [step, setStep] = useState(0)
  const [options, setOptions] = useState({
    node: "",
    firmware: "",
    bootImage: "",
    provision: "True",
    tags: "",
  })

  return (
    <FormGroup>
      <Box>
        <Box
          sx={{
            marginBottom: "30px",
            marginTop: "30px",
            width: "100%",
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

        {/* Content */}
        <Box sx={{ margin: "20px" }}>
          {step === 0 && <NodeOptions options={options} setOptions={setOptions} />}
          {step === 1 && <ConfigureInterfaces />}
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex" }}>
          <Button onClick={() => setStep(step - 1)} disabled={step === 0 ? true : false} variant="outlined">
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }}></Box>
          {step < 2 && (
            <Button onClick={() => setStep(step + 1)} variant="outlined">
              Next
            </Button>
          )}
          {step >= 2 && <Button variant="outlined">Finish</Button>}
        </Box>
      </Box>
    </FormGroup>
  )
}

export default AddNode
