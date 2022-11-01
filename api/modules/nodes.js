const Nodes = require("../models/Nodes")
const { grendelRequest } = require("./grendel")
const { redfishRequest } = require("./redfish/redfish")

const fetch_node = async (node, refetch) => {
  let status = "error"
  let db_res = await Nodes.findOne({ node: node })
  // || db_res?.redfish.status === "error"
  if (refetch === "true" || db_res === null) {
    let grendel = await grendelRequest(`/v1/host/find/${node}`)
    if (grendel.status !== "success") return grendel

    let redfish = await redfishRequest(node)
    let old_data = await Nodes.findOneAndUpdate(
      { node: node },
      { node: node, grendel, redfish },
      { new: true, upsert: true }
    )
    status = [grendel.status, redfish.status].includes("error") ? "error" : "success"

    return {
      status: status,
      node: node,
      grendel,
      redfish,
      notes: old_data.notes ?? "",
    }
  } else {
    status = [db_res.grendel.status, db_res.redfish.status].includes("error") ? "error" : "success"
    return {
      status: status,
      node: node,
      grendel: db_res.grendel,
      redfish: db_res.redfish,
      notes: db_res.notes ?? "",
    }
  }
}

const dell = async (bmc) => {}

module.exports = { fetch_node }
