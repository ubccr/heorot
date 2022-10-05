const express = require("express")
const app = express.Router()

const { grendelRequest } = require("../modules/grendel")
const { pduFormat, switchFormat, nodeFormat, quadNodeFormat } = require("../modules/client")
const config = require("../config")
const Switches = require("../models/Switches")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/client/",
    availibleRoutes: routes,
  })
})

app.get("/v1/floorPlan", async (req, res) => {
  const floorX = config.floorplan.floorX
  const floorY = config.floorplan.floorY

  let grendel_query = await grendelRequest("/v1/host/list")
  let switch_query = await Switches.find({ node: /^swe/ })

  if (grendel_query.status === "success" && switch_query !== null) {
    let nodes = new Map()
    let switches = new Map()

    // Create maps for easy filtering
    grendel_query.result.forEach((val) => {
      let rack = val.name.substring(4, 7)
      let tmp = typeof nodes.get(rack) === "object" ? nodes.get(rack) : []
      nodes.set(rack, [...tmp, val])
    })
    switch_query.forEach((val) => {
      let rack = val.node.substring(4, 7)
      let tmp = typeof switches.get(rack) === "object" ? switches.get(rack) : []
      switches.set(rack, [...tmp, val])
    })

    // Main floorplan generation
    let floorplan = floorX.map((row) => {
      return floorY.map((col) => {
        let rack = row + col
        let rackArr = nodes.get(rack) ?? []
        let switchArr = switches.get(rack) ?? []
        let nodeCounts = nodeCount(rackArr)
        let switchInfo = swDisplay(switches.get(rack))
        return {
          rack: rack,
          // nodes: rackArr,
          // switches: switchArr,
          slurm: compareTags(rackArr),
          node_count: nodeCounts.node_count,
          u_count: nodeCounts.u_count,
          switchInfo,
        }
      })
    })

    let tmp2 = Object.fromEntries(nodes)
    res.json({ status: "success", floorX, floorY, result: floorplan })
  } else
    res.json({
      status: "error",
      message: "Failed to fetch Grendel or Switch Data",
      error: { location: "/api/routes/client.js", grendel_query, switch_query },
    })
})

// rack information
const nodeCount = (arr) => {
  let node_count = 0
  let u_count = 0

  arr.forEach((val) => {
    let type = val.name.substring(0, 3)
    if (!["pdu"].includes(type)) {
      if (!["swe", "swi"].includes(type)) node_count++
      u_count++
      // check for mult u nodes
      if (val.tags !== null) {
        val.tags.forEach((val) => {
          if (val.match(/^[0-9]{1,2}u/)) {
            u_count += parseInt(val.match(/^[0-9]{1,2}/)) - 1
          }
        })
      }
    }
  })
  return { node_count, u_count }
}

// set rack partitions and colors
const compareTags = (arr) => {
  let output = {
    partition: "",
    color: "",
  }
  let tags = new Set()
  if (arr !== undefined && arr.length > 0) {
    arr.forEach((val) => {
      if (val.tags !== null) val.tags.forEach((tag) => tags.add(tag))
    })

    config.floorplan.tag_mapping.forEach((val) => {
      if (tags.has(val.tag) && output.partition === "") {
        output.partition = val.tag
        output.color = val.color
      } else if (tags.has(val.tag) && output.partition !== "") {
        output.partition = config.floorplan.tag_multiple.display
        output.color = config.floorplan.tag_multiple.color
      }
    })
  }
  return output
}

// switch display info
const swDisplay = (switches) => {
  let output = {
    sw_models: "",
    sw_models_color: "",
    sw_versions: "",
    sw_versions_color: "",
    sw_ratios: "",
  }
  let tmpModels = []
  let tmpVersions = []
  let tmpRatios = []

  if (switches !== undefined) {
    switches.forEach((val) => {
      tmpModels.push(shortenName(val.system.model))
      tmpVersions.push(shortenVersion(val.system.version))
      tmpRatios.push(val.info.active_oversubscription)
    })
    // model color mapping | based on if a switch model is present in the rack
    let tmpModelColor = config.floorplan.color_mapping.default_color
    config.floorplan.color_mapping.model_color.forEach((val) => {
      if (tmpModels.find((x) => x.match(val.model))) tmpModelColor = val.color
    })
    output.sw_models_color = tmpModelColor

    // Version color mapping
    let tmpVersionColor = config.floorplan.color_mapping.default_color
    config.floorplan.color_mapping.version_color.forEach((val) => {
      if (tmpVersions.find((x) => x.match(val.version))) tmpVersionColor = val.color
    })
    output.sw_versions_color = tmpVersionColor

    // Count duplicates
    output.sw_models = tmpModels.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})
    output.sw_versions = tmpVersions.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})
    output.sw_ratios = tmpRatios.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})
  }
  return output
}

// switch colors
// const swColors = () {

// }

const shortenName = (name) => {
  if (name.match("^PowerConnect")) return "PC" + name.substring(13)
  else if (name.match("-ON")) return name.replace("-ON", "")
  else return name
}
const shortenVersion = (version) => {
  if (version !== undefined) return version.replace(/ *\([^)]*\) */g, "")
  else return "undefined"
}

app.get("/rack/:rack", async (req, res) => {
  const rack = req.params.rack
  let rackRes = await grendelRequest(`/v1/host/tags/${rack}`)
  if (rackRes.status === "success") {
    let resGrendel = rackRes.result
    let nodes = new Array(43).fill().map((val, index) => {
      return { u: index, type: "" }
    })
    let pdu = new Array(5).fill().map((val, index) => {
      return { pdu: index }
    })

    resGrendel.forEach((element) => {
      let nodeset = element.name.split("-")
      let resPdu,
        resSwitch,
        resNode = {}

      if (nodeset[0] === "srv" || nodeset[0] === "cpn") {
        if (nodeset.length === 4) {
          // quad nodes
          resNode = quadNodeFormat(element, nodeset)
          let u = resNode.u
          let pos = resNode.position

          // set nodes obj to array if not already
          if (typeof nodes[u].node !== "object") nodes[u].node = []
          if (typeof nodes[u].tags !== "object") nodes[u].tags = []

          nodes[u].node[pos] = resNode.node
          nodes[u].tags[pos] = resNode.tags
          nodes[u].height = resNode.height
          nodes[u].width = resNode.width
          nodes[u].type = "node"
        } else {
          // single nodes
          resNode = nodeFormat(element, nodeset)
          if (resNode.height > 1) {
            // multi u node
            let offset = resNode.height - 1
            let offsetU = resNode.u + offset

            nodes[offsetU] = resNode
            nodes[offsetU].u = offsetU
            nodes[offsetU].type = "node"

            for (let i = offset; i > 0; i--) {
              nodes[offsetU - i].type = "rowSpan"
            }
          } else nodes[resNode.u] = resNode
        }
      } else if (nodeset[0] === "swe") {
        if (element.tags.includes("core-switch")) {
          resNode = nodeFormat(element, nodeset)
          let u = parseInt(nodeset[2])
          if (resNode.height > 1) {
            // multi u node
            let offset = resNode.height - 1
            let offsetU = resNode.u + offset

            nodes[offsetU] = resNode
            nodes[offsetU].u = offsetU
            nodes[offsetU].type = "switch"
            nodes[offsetU].ports = []

            for (let i = offset; i > 0; i--) {
              nodes[offsetU - i].type = "rowSpan"
            }
          } else
            nodes[u] = {
              u: u,
              node: element.name,
              ports: [],
              tags: element.tags,
              height: 1,
              width: 1,
              type: "switch",
            }
        } else {
          resSwitch = switchFormat(element, nodeset, resGrendel)
          nodes[resSwitch.u] = resSwitch
        }
      } else if (nodeset[0] === "swi") {
        let u = parseInt(nodeset[2])
        nodes[u] = {
          u: u,
          node: element.name,
          ports: [],
          tags: [],
          height: 1,
          width: 1,
          type: "switch",
        }
      } else if (nodeset[0] === "pdu") {
        resPdu = pduFormat(element, nodeset)
      }
    })

    res.json({
      status: "success",
      rack: rack,
      result: { nodes: nodes, pdu: pdu },
    })
  }
})

app.get("/node/:node", async (req, res) => {
  const node = req.params.node
  let result = []

  let nodeRes = await grendelRequest(`/v1/host/find/${node}`)
  if (nodeRes.status === "success") {
    let nodes = nodeRes.result
    if (nodes.length > 0) {
      nodes.forEach((element) => {
        result.push(element)
      })
      let bmcPlugin = false
      if (config.bmc.DELL_USER !== "") bmcPlugin = true

      res.json({
        status: "success",
        node: node,
        result: result,
        bmc: bmcPlugin,
      })
    } else {
      res.json({
        status: "error",
        message: "Node not found",
      })
    }
  } else {
    res.json({
      status: nodeRes.status,
      result: nodeRes.result,
      code: nodeRes.code,
    })
  }
})

module.exports = app
