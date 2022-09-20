import { Badge, Button, Chip, Tooltip } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"

import { Link } from "react-router-dom"

const Rack = ({ rack, outputType, nodesQuery, switchQuery }) => {
  const [output, setOutput] = useState("")
  const [populatedRack, setPopulatedRack] = useState(false)
  const [switchModels, setSwitchModels] = useState("")
  const [switchVersions, setSwitchVersions] = useState("")
  const [switchRatio, setSwitchRatio] = useState("")

  const shortenName = (name) => {
    if (name.match("^PowerConnect")) return "PC" + name.substring(13)
    else if (name.match("-ON")) return name.replace("-ON", "")
    else return name
  }
  const shortenVersion = (version) => {
    if (version !== undefined) return version.replace(/ *\([^)]*\) */g, "")
    else return version
  }

  if (nodesQuery.isFetched && nodesQuery.data.status === "success") {
    let tmp = nodesQuery.data.result.find((val) => val.name.split("-")[1] === rack)
    if (tmp !== undefined && !populatedRack) {
      setPopulatedRack(true)
      if (switchQuery.isFetched && switchQuery.data.status === "success") {
        let swModel = []
        let swVersion = []
        let swRatio = []
        switchQuery.data.result.forEach((val) => {
          if (val.node.split("-")[1] === rack) {
            swModel.push(shortenName(val.result.output.model))
            swVersion.push(shortenVersion(val.result.output.version))
            if (val.info.status === "success" && val.info.activeOversubscription > 0)
              swRatio.push(val.info.activeOversubscription)
          }
        })

        if (swModel.length > 0) {
          let dup = swModel.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})

          setSwitchModels(
            Object.keys(dup).map((val) => {
              let count = dup[val] > 1 ? `(${dup[val]})` : ""
              return `${count}${val}\n`
            })
          )
        } else setSwitchModels(rack)
        if (swVersion.length > 0) {
          let dup = swVersion.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})

          setSwitchVersions(
            Object.keys(dup).map((val) => {
              let count = dup[val] > 1 ? `(${dup[val]})` : ""
              if (val !== "undefined") return `${count}${val}\n`
            })
          )
        } else setSwitchVersions(rack)
        if (swRatio.length > 0) {
          let dup = swRatio.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})

          setSwitchRatio(
            Object.keys(dup).map((val) => {
              let count = dup[val] > 1 ? `(${dup[val]})` : ""
              if (val !== "undefined") return `${count}${val}\n`
            })
          )
        } else setSwitchRatio(rack)
      }
    }
  }

  useEffect(() => {
    if (populatedRack) {
      if (outputType === "rack") {
        setOutput(rack)
      } else if (outputType === "switchModel") {
        setOutput(switchModels)
      } else if (outputType === "switchVersion") {
        setOutput(switchVersions)
      } else if (outputType === "switchRatio") {
        setOutput(switchRatio)
      }
    }

    return () => {
      setOutput("")
      setPopulatedRack(false)
    }
  }, [populatedRack, outputType])

  return (
    <>
      {populatedRack && (
        <Tooltip title={rack} placement="top" arrow>
          <Button
            component={Link}
            to={`/Rack/${rack}`}
            size="small"
            variant="outlined"
            sx={{ textTransform: "lowercase", minWidth: 40, paddingLeft: "4px", paddingRight: "4px" }}
          >
            {output}
          </Button>
        </Tooltip>
      )}
    </>
  )
}

export default Rack
