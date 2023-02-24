const express = require("express")
const app = express.Router()

const { grendelRequest } = require("../modules/grendel")
const { rackGen, floorplan } = require("../modules/client")
const config = require("../config")
const Switches = require("../models/Switches")
// const { redfishRequest } = require("../modules/redfish/redfish")
const Nodes = require("../models/Nodes")
const { fetch_node } = require("../modules/nodes")
const Settings = require("../models/Settings")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push("/client" + element.route.path)
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

app.get("/v1/rack/:rack/:refetch?", async (req, res) => {
  const rack = req.params.rack
  const refetch = req.params.refetch ?? "false"

  let grendel_res = await grendelRequest(`/v1/host/tags/${rack}`)
  // let grendel_res_all = await grendelRequest(`/v1/host/list`) need to change filter functions in rackGen
  if (grendel_res.status === "error") res.json(grendel_res)
  // let grendel_res = grendel_res_all.result.filter((node) => node.name.split("-")[1] === rack)

  let rackArr = []
  for (let x = config.rack.min; x <= config.rack.max; x++) {
    rackArr[x] = {
      u: x,
      type: "",
    }
  }

  let nodes = await rackGen(grendel_res, rackArr.filter(Boolean), refetch)

  // offset function | needed because of how html tables generate, multi u nodes need their data in the top most u, all other u's must be a rowspan cell
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].height > 1) {
      let offset = i + nodes[i].height - 1
      let offsetU = nodes[offset].u

      nodes[offset] = { ...nodes[i], u: offsetU }
      nodes[i] = { u: nodes[i].u, type: "rowSpan", height: nodes[i].height, width: nodes[i].width, grendel: [] }

      // set other el to rowspan
      for (let x = 1; x < nodes[i].height; x++) {
        nodes[i + x - 1].type = "rowSpan"
      }

      i += nodes[i].height - 1 // skip
    }
  }

  res.json({
    status: "success",
    rack: rack,
    nodes: nodes.reverse(),
    // pdu: [],
  })
})

app.get("/v1/node/:node/:refresh?", async (req, res) => {
  const node = req.params.node
  const refresh = req.params.refresh ?? "false"

  let rack = node.split("-")[1] ?? ""
  let nodeRes = await grendelRequest(`/v1/host/find/${node}`)
  let rack_res = await grendelRequest(`/v1/host/tags/${rack}`)
  let boot_image_res = await grendelRequest(`/v1/bootimage/list`)
  let boot_image_list = boot_image_res.status === "success" ? boot_image_res.result : []

  if (nodeRes.status === "success" && nodeRes.result.length > 0 && rack_res.status === "success") {
    let nodeList = rack_res.result.map((val) => val.name).sort((a, b) => a.split("-")[2] - b.split("-")[2])
    let prevNode = nodeList.indexOf(node) < nodeList.length - 1 ? nodeList[nodeList.indexOf(node) + 1] : nodeList[0]
    let nextNode = nodeList.indexOf(node) > 0 ? nodeList[nodeList.indexOf(node) - 1] : nodeList[nodeList.length - 1]
    let message = undefined
    if (nodeRes.result.length > 1) {
      message = "Warning: More than one node with matching name found."
      nodeRes.result.forEach((node) => (message += ` id: ${node.id}`))
    }
    let bmcPlugin = false
    if (config.bmc.DELL_USER !== "") bmcPlugin = true

    if (refresh === "true") await fetch_node(node, refresh)

    let dbRequest = await Nodes.findOne({ node: node })

    res.json({
      status: "success",
      node: node,
      previous_node: prevNode,
      next_node: nextNode,
      result: nodeRes.result[0],
      redfish: dbRequest?.redfish,
      warranty: dbRequest?.warranty,
      notes: dbRequest?.notes ?? "",
      firmware_options: config.firmware,
      boot_image_options: boot_image_list,
      message: message,
      bmc_plugin: bmcPlugin,
    })
  } else {
    res.json({
      status: "error",
      message: "Node not found",
      error: { nodeRes, rack_res },
    })
  }
})

app.post("/v1/notes", async (req, res) => {
  /*
  body: {
    new_notes: { updated notes },
    old_notes: { old notes },
    overwrite?: true | false
  }
*/
  let query_verify = await Nodes.findOne({ node: req.body.node })

  if (req.body.overwrite !== true && query_verify.notes !== undefined && query_verify.notes !== req.body.old_notes) {
    res.json({
      status: "error",
      message: "Error, notes have been modified by another user! Submit again to overwrite changes.",
      code: "EOVERWRITE",
      overwrite: query_verify.notes,
    })
    return
  }

  let query = await Nodes.updateOne({ node: req.body.node }, { notes: req.body.new_notes })
  if (query.modifiedCount > 0) res.json({ status: "success", message: "Successfully updated notes!" })
  else res.json({ status: "error", message: "Error, notes unchanged" })
})

app.get("/v1/settings", async (req, res) => {
  let query = await Settings.find({}, { _id: 0, __v: 0 })
  res.json(query)
})
// app.post("/v1/settings", async (req, res) => {
/*
  body: {
    new: { updated Settings model },
    previous: { old Settings model },
  }
*/
// let query_verify = await Settings.find({}, { _id: 0, __v: 0 })
// let query_update = await Settings.findOneAndUpdate({}, req.body)
// })

module.exports = app
