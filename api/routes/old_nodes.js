const express = require("express")
const app = express.Router()

const Nodes = require("../models/Nodes")
const { fetch_node } = require("../modules/nodes")
const { timeComp } = require("../modules/cache")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/redfishV2/",
    availibleRoutes: routes,
  })
})

// Route to fetch Redfish data from DB
app.get("/v2/all/:node", async (req, res) => {
  const node = req.params.node
  let node_res = await Nodes.findOne({ node: node })
  if (node_res !== null) {
    res.json({
      status: "success",
      refresh: timeComp(node_res.updatedAt),
      node: node_res.node,
      grendel: node_res.grendel,
      redfish: node_res.redfish,
    })
  } else res.json({ status: "error", refetch: true, message: "Node not found in the DB" })
})

// Route to call when node data is stale
app.get("/v2/refresh/:node", async (req, res) => {
  const node = req.params.node

  let node_res = await fetch_node(node)

  res.json(node_res)
})

module.exports = app
