import { Button, Tooltip } from "@mui/material"
import React, { useEffect } from "react"

import { Link } from "react-router-dom"
import { useState } from "react"

const CellRack = ({ rack, outputType, color }) => {
  const [output_t, setOutput_t] = useState("")
  const [output_b, setOutput_b] = useState("")
  const [output_c, setOutput_c] = useState(rack.default_color)

  if (rack.switchInfo.sw_models === undefined) console.log(rack)
  useEffect(() => {
    if (outputType === "rack") {
      setOutput_t(`Nodes: ${rack.node_count} | Rack U: ${rack.u_count}`)
      setOutput_b(rack.rack)
      setOutput_c(color === true ? rack.slurm.color : rack.default_color)
    } else if (outputType === "sw_model") {
      setOutput_t(rack.rack)
      setOutput_b(rack.switchInfo.sw_models.join("\n") !== "" ? rack.switchInfo.sw_models.join("\n") : rack.rack)
      setOutput_c(color === true ? rack.switchInfo.sw_models_color : rack.default_color)
    } else if (outputType === "sw_version") {
      setOutput_t(rack.rack)
      setOutput_b(rack.switchInfo.sw_versions.join("\n") !== "" ? rack.switchInfo.sw_versions.join("\n") : rack.rack)
      setOutput_c(color === true ? rack.switchInfo.sw_versions_color : rack.default_color)
    } else if (outputType === "sw_ratio") {
      setOutput_t(rack.rack)
      setOutput_b(rack.switchInfo.sw_ratios.join("\n") !== "" ? rack.switchInfo.sw_ratios.join("\n") : rack.rack)
      setOutput_c(color === true ? rack.switchInfo.sw_ratios_color : rack.default_color)
    } else if (outputType === "node_count") {
      setOutput_t(rack.rack)
      setOutput_b(rack.node_count)
      setOutput_c(color === true ? rack.switchInfo.sw_ratios_color : rack.default_color)
    }
  }, [outputType, color])

  return (
    <Tooltip title={output_t} placement="top" arrow>
      <Button
        component={Link}
        to={`/Rack/${rack.rack}`}
        size="small"
        variant="outlined"
        color={output_c}
        sx={{
          textTransform: "lowercase",
          minWidth: 40,
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        {output_b}
      </Button>
    </Tooltip>
  )
}

export default CellRack
