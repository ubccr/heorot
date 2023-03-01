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

const refetch_all_nodes = async (hours = 1) => {
  console.log("Starting refresh of Redfish data")
  let expired_time = new Date()
  expired_time.setHours(expired_time.getHours() - hours)

  let nodes = await Nodes.find({}, { node: 1, redfish: 1, _id: 0, updatedAt: 1 })

  let response = await Promise.all(
    nodes.filter((val) => val.updatedAt < expired_time).map((node) => fetch_node(node.node, "true"))
  )
  console.log(response)
  return response
}

function schedule_node_refresh() {
  refetch_all_nodes()
    .then(function () {
      console.log("Refreshed all Redfish data, waiting an hour")
      setTimeout(function () {
        console.log("Refetching Redfish data...")
        schedule_node_refresh()
      }, 1000 * 60 * 60)
    })
    .catch((err) => console.error("Error refreshing Redfish data automatically", err))
}

schedule_node_refresh()

module.exports = { fetch_node }
