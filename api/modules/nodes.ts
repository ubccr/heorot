import { Nodes } from "../models/Nodes.js"
import config from "../../config/config.js"
import { getSw } from "./switches.js"
import { grendelRequest } from "./grendel.js"
import { redfishRequest } from "./redfish.js"

export const fetch_node = async (node: string, refetch: string) => {
  let status = "error"
  let db_res: any = await Nodes.findOne({ node: node })

  if (refetch === "true" || db_res === null) {
    let grendel = await grendelRequest(`/v1/host/find/${node}`)
    if (grendel.status !== "success") return grendel

    let redfish: any = await redfishRequest(node)
    let service_tag = redfish.service_tag
    // Switches:
    let switch_data = { success: false }
    let switch_prefix = config.settings?.rack.prefix.find((val: any) => val.type === "switch")?.prefix
    if (switch_prefix.includes(node.split("-")[0])) switch_data = await getSw(node)

    let old_data = await Nodes.findOneAndUpdate(
      { node: node },
      { node: node, service_tag, grendel, switch_data, redfish },
      { new: true, upsert: true }
    )
    status = grendel.status

    return {
      status: status,
      node: node,
      service_tag,
      grendel,
      redfish,
      switch_data,
      notes: old_data.notes ?? "",
    }
  } else {
    status = [db_res.grendel.status, db_res.redfish.status].includes("error") ? "error" : "success"
    return {
      status: status,
      node: node,
      grendel: db_res.grendel,
      redfish: db_res.redfish,
      switch_data: db_res.switch_data,
      warranty: db_res.warranty,
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

  let response = await Promise.all(
    nodes.filter((val) => val.updatedAt < expired_time).map((node) => fetch_node(node.node, "true"))
  )
  return response
}

export function schedule_node_refresh() {
  let refresh_interval = config.settings?.bmc.refresh_interval ?? 0
  refetch_all_nodes(refresh_interval ?? 0)
    .then(function () {
      console.log(`Refreshed all Redfish data, waiting ${refresh_interval} minute(s)`)
      if (refresh_interval > 0) {
        setTimeout(function () {
          console.log("Refetching Redfish data...")
          schedule_node_refresh()
        }, 1000 * 60 * refresh_interval ?? 60)
      }
    })
    .catch((err) => console.error("Error refreshing Redfish data automatically", err))
}

// schedule_node_refresh()
