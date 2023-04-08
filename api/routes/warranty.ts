import { Nodes } from "../models/Nodes.js"
import config from "../../config/config.js"
import express from "express"
import { fetch_node } from "../modules/nodes.js"
import { getSwInfoV2 } from "../modules/switches.js"
import { grendelRequest } from "../modules/grendel.js"
import { host } from "../types/grendel.js"
import { warrantyApiReq } from "../modules/Warranty.js"
const app = express.Router()

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/warranty" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/warranty/",
    availibleRoutes: routes,
  })
})

app.post("/v1/add", async (req, res) => {
  /*
  body: {
    tags?: ["foo", "bar"],
    refresh?: false,
    service_tags?: ["AAA000", "BBB000"]
  }
  */
  const tags = req.body.tags?.join(",")
  const refresh = req.body?.refresh ?? false
  const service_tags = req.body?.service_tags

  // skip node queries to allow for nodes not in Grendel / DB
  if (service_tags !== undefined) {
    let warranty_res = await warrantyApiReq(service_tags.join(","))
    res.json(warranty_res)
    return
  }

  // Get list of nodes from grendel
  let url = `/v1/host/tags/${tags}`
  if (tags === undefined || tags === "") url = `/v1/host/list`

  let grendel_res: grendelRequest<host[]> = await grendelRequest(url)

  if (grendel_res.status !== "success" || !grendel_res.result) {
    res.json(grendel_res)
    return
  }

  let nodes_db_res = await Nodes.find({})
  let service_tag_arr: string[] = []

  for (const host of grendel_res.result) {
    let node_match = nodes_db_res.find((db_val) => db_val.node === host.name)
    if (!node_match) {
      // if no match is found, attempt to query the node
      let tmp_match = await fetch_node(host.name, "true")
      if (refresh || tmp_match?.warranty.entitlements.length === 0)
        // push ST if entitlements is empty
        service_tag_arr.push(tmp_match.service_tag)
    } else if (refresh || node_match.warranty?.entitlements.length === 0) service_tag_arr.push(node_match.service_tag)
  }

  // if st array is empty, return
  let filtered_service_tag_arr = service_tag_arr.filter(Boolean)

  if (filtered_service_tag_arr.length === 0) {
    let response =
      refresh === true
        ? { status: "error", message: "No nodes were found " }
        : { status: "success", message: "No new nodes found" }
    res.json(response)
    return
  }

  // Dell query
  let warranty_res = await warrantyApiReq(filtered_service_tag_arr.join(","))

  if (warranty_res.status !== "success") {
    res.json(warranty_res)
    return
  }
  // DB update
  let modified_count = 0
  for (const val of warranty_res.result) {
    let filter = { service_tag: val.serviceTag }
    let update = {
      warranty: {
        shipDate: val.shipDate,
        productLineDescription: val.productLineDescription,
        entitlements: val.entitlements,
      },
    }
    let db_res = await Nodes.updateOne(filter, update)
    if (db_res.modifiedCount === 1) modified_count++
    else console.error(db_res)
  }

  res.json({ status: "success", message: `${modified_count} out of ${warranty_res.result.length} nodes updated` })
})

app.get("/v1/get/:node", async (req, res) => {
  const node = req.params.node

  let db_res = await Nodes.findOne({ node: node }, { warranty: 1 })
  res.json(db_res)
})

export default app
