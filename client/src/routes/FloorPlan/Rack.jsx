import { Badge, Button, Tooltip } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"

const Rack = ({ rack, outputType, nodesQuery, switchQuery }) => {
  const [output, setOutput] = useState("")
  const [outputArr, setOutputArr] = useState([])
  const [outputArrIndex, setOutputArrIndex] = useState(0)

  const shortenName = (name) => {
    if (name.match("^PowerConnect")) return `PC${name.substring(12)}`
    else if (name.match("-ON")) return name.substring(0, 6)
    else return name
  }

  if (nodesQuery.isFetched && nodesQuery.data.status === "success") {
    let tmp = nodesQuery.data.result.find((val) => val.name.split("-")[1] === rack)
    if (tmp !== undefined && output === "") {
      if (switchQuery.isFetched && switchQuery.data.status === "success") {
        let tmp = switchQuery.data.result
          .map((val) => {
            if (val.node.split("-")[1] === rack) {
              if (outputType === "switchModel") return shortenName(val.result.output.model)
              else if (outputType === "switchVersion") return val.result.output.version
            }
          })
          .filter(Boolean)

        if (tmp.length > 0) {
          setOutput(tmp.join(", "))
          setOutputArr(tmp)
        }
      }
      if (outputType === "rack") setOutput(rack)
    }
  }

  return (
    <>
      {output !== "" && (
        <Tooltip title={outputArr.join(", ")}>
          <Button variant="outlined" color="primary" size="small">
            {output}
          </Button>
        </Tooltip>
      )}
    </>
  )
}

export default Rack
