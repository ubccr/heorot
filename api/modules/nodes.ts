import { Nodes } from "../models/Nodes.js"
import config from "../../config/config.js"
import { grendelRequest } from "./grendel.js"
import { redfishRequest } from "./redfish.js"

export const fetch_node = async (node: string, refetch: string) => {
  let status = "error"
  let db_res: any = await Nodes.findOne({ node: node })
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
    status = [grendel.status].includes("error") ? "error" : "success"

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

const refetch_all_nodes = async (minutes = 0) => {
  if (minutes === 0) return
  console.log("Starting refresh of Redfish data")
  let expired_time = new Date()
  expired_time.setMinutes(expired_time.getMinutes() - minutes)

  let nodes = await Nodes.find({}, { node: 1, redfish: 1, _id: 0, updatedAt: 1 })
  // console.log(nodes.filter((val) => val.updatedAt < expired_time))
  let response = await Promise.all(
    nodes.filter((val) => val.updatedAt < expired_time).map((node) => fetch_node(node.node, "true"))
  )
  return response
}

export function schedule_node_refresh() {
  refetch_all_nodes(config.settings?.bmc.refresh_interval ?? 0)
    .then(function () {
      console.log(`Refreshed all Redfish data, waiting ${config.settings?.bmc.refresh_interval} minute(s)`)
      if (config.settings?.bmc.refresh_interval > 0) {
        setTimeout(function () {
          console.log("Refetching Redfish data...")
          schedule_node_refresh()
        }, 1000 * 60 * config.settings.bmc?.refresh_interval ?? 60)
      }
    })
    .catch((err) => console.error("Error refreshing Redfish data automatically", err))
}

schedule_node_refresh()
