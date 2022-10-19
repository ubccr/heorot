const fetch = require("node-fetch")
let config = require("../config")
const { grendelRequest } = require("./grendel")
const { redfishRequest } = require("./redfish/redfish")

const fetch_node = async (node) => {
  let grendel = await grendelRequest(`/v1/host/find/${node}`)
  if (grendel.status !== "success") return grendel

  let redfish = await redfishRequest(node)
  // TODO: cache in DB

  return {
    status: "success",
    grendel,
    redfish,
  }
}

const dell = async (bmc) => {}

module.exports = { fetch_node }
