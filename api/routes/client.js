const express = require("express")
const app = express.Router()

const { grendelRequest } = require("../modules/grendel")
const { rackGen, pduFormat, switchFormat, nodeFormat, quadNodeFormat, floorplan } = require("../modules/client")
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
  let grendel_query = await grendelRequest("/v1/host/list")
  let switch_query = await Switches.find({ node: /^swe/ })

  if (grendel_query.status === "success" && switch_query !== null) {
    let funcRes = floorplan(grendel_query, switch_query, config)
    res.json(funcRes)
  } else
    res.json({
      status: "error",
      message: "Failed to fetch Grendel or Switch Data",
      error: { location: "/api/routes/client.js", grendel_query, switch_query },
    })
})

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

app.get("/v1/rack/:rack", async (req, res) => {
  const rack = req.params.rack

  let grendel_res = await grendelRequest(`/v1/host/tags/${rack}`)
  if (grendel_res.status === "error") res.json(grendel_res)
  let rackArr = []
  for (let x = config.rack.min; x <= config.rack.max; x++) {
    rackArr[x] = {
      u: x,
      type: "",
    }
  }

  let nodes = await rackGen(grendel_res, rackArr.filter(Boolean))

  res.json({
    status: "success",
    rack: rack,
    nodes: nodes,
    // pdu: [],
  })
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
