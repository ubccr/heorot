import { Button, Tooltip } from "@mui/material"
import React, { useEffect, useState } from "react"

import { Link } from "react-router-dom"

const Rack = ({ rack, outputType, colorType, nodesQuery, switchQuery }) => {
  const [output, setOutput] = useState("")
  const [tooltipOutput, setTooltipOutput] = useState(rack)
  const [color, setColor] = useState("primary")

  const [populatedRack, setPopulatedRack] = useState(false)
  const [switchModels, setSwitchModels] = useState("")
  const [switchVersions, setSwitchVersions] = useState("")
  const [switchRatio, setSwitchRatio] = useState("")
  const [rackPartition, setRackPartition] = useState("")
  const [nodeCount, setNodeCount] = useState(0)

  const shortenName = (name) => {
    if (name !== null) {
      if (name.match("^PowerConnect")) return "PC" + name.substring(13)
      else if (name.match("-ON")) return name.replace("-ON", "")
      else return name
    } else return undefined
  }
  const shortenVersion = (version) => {
    if (version !== null) {
      if (version !== undefined) return version.replace(/ *\([^)]*\) */g, "")
      else return version
    } else return undefined
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
            Object.keys(dup)
              .map((val) => {
                let count = dup[val] > 1 ? `(${dup[val]})` : ""
                if (val !== "undefined") return `${count}${val}\n`
                return null
              })
              .filter(Boolean)
          )
        } else setSwitchVersions(rack)
        if (swRatio.length > 0) {
          let dup = swRatio.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})

          setSwitchRatio(
            Object.keys(dup)
              .map((val) => {
                let count = dup[val] > 1 ? `(${dup[val]})` : ""
                if (val !== "undefined") return `${count}${val}\n`
                return null
              })
              .filter(Boolean)
          )
        } else setSwitchRatio(rack)

        let count = 0
        let rackNodes = nodesQuery.data.result
          .map((val) => {
            if (val.name.split("-")[1] === rack) {
              if (!val.name.match("^pdu")) count++
              return val
            }
            return null
          })
          .filter(Boolean)
        setNodeCount(count)

        // rack partiotion type
        let allTags = rackNodes
          .map((val) => {
            if (val.tags !== null && val.tags.includes("ubhpc")) return "ubhpc"
            else if (val.tags !== null && val.tags.includes("faculty")) return "faculty"
            return null
          })
          .filter(Boolean)
        if (allTags.length > 2) {
          let tmp = allTags.sort().filter((item, pos, arr) => {
            return !pos || item !== arr[pos - 1]
          })
          if (tmp.length > 1) setRackPartition("mixed")
          else if (tmp.length === 1) setRackPartition(tmp[0])
        }
      }
    }
  }

  // button output & coloring:
  useEffect(() => {
    if (populatedRack) {
      switch (outputType) {
        case "rack":
          setOutput(rack)
          setTooltipOutput(`Nodes: ${nodeCount}`)
          if (colorType === "default") {
            setColor("primary")
          } else if (colorType === "colorful") {
            if (rackPartition === "ubhpc") setColor("primary")
            else if (rackPartition === "faculty") setColor("success")
            else if (rackPartition === "mixed") setColor("error")
            else setColor("floorplan")
          }
          break
        case "switchModel":
          setOutput(switchModels)
          setTooltipOutput(rack)
          if (colorType === "default") {
            setColor("primary")
          } else if (colorType === "colorful") {
            if (typeof switchModels === "object") {
              if (switchModels.includes("PC6248\n") || switchModels.includes("S3048\n")) {
                setColor("error")
              }
            } else if (typeof switchVersions === "string") setColor("floorplan")
          }
          break
        case "switchVersion":
          setOutput(switchVersions)
          setTooltipOutput(rack)
          if (colorType === "default") {
            setColor("primary")
          } else if (colorType === "colorful") {
            if (typeof switchVersions === "object") {
              switchVersions.forEach((val, index) => {
                if (val !== undefined && val.match(/^(\([0-9]\))?10/gm)) setColor("success")
                else if (val !== undefined && val.match(/^(\([0-9]\))?9/gm)) setColor("warning")
                else if (val !== undefined && val.match(/^(\([0-9]\))?8/gm)) setColor("error")
              })
            } else if (typeof switchVersions === "string") setColor("floorplan")
          }
          break
        case "switchRatio":
          setOutput(switchRatio)
          setTooltipOutput(rack)
          setColor("primary")
          break
        case "nodeCount":
          setOutput(nodeCount)
          setTooltipOutput(rack)
          setColor("primary")
          break
        default:
          break
      }
    }

    return () => {
      setOutput("")
      setColor("primary")
      setPopulatedRack(false)
    }
  }, [populatedRack, outputType, colorType])

  return (
    <>
      {populatedRack && (
        <Tooltip title={tooltipOutput} placement="top" arrow>
          <Button
            component={Link}
            to={`/Rack/${rack}`}
            size="small"
            variant="outlined"
            color={color}
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
