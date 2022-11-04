const fetch = require("node-fetch")
const https = require("https")

const { redfish_auth, redfish_logout } = require("./auth")
const { dell_query } = require("./dell")
const { getBMC } = require("../grendel")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

async function api_request(url, token, method = "GET", json = true, body = undefined) {
  try {
    let header = {
      method: method,
      headers: { "X-Auth-Token": token, "content-type": "application/json" },
      body,
      agent,
    }
    let res = new Object()
    if (typeof url === "string") {
      // Single request
      let res_promise = await fetch(url, header)

      if (json === true) res = await res_promise.json()
      else res = res_promise
      if (res.hasOwnProperty("error")) throw res.error
    } else if (typeof url === "object") {
      // Parallel requests
      res = await Promise.all(
        url.map(async (u) => {
          const res = await fetch(u, header)
          return res.json()
        })
      )
    }

    return { status: "success", data: res }
  } catch (error) {
    return {
      status: "error",
      message: "Redfish API Request error",
      error,
    }
  }
}

const redfishRequest = async (node) => {
  let bmc = await getBMC(node)
  if (bmc.status !== "success") return bmc

  let url = `https://${bmc.address}`

  let auth = await redfish_auth(url) // authenticate to BMC and collect info
  if (auth.status !== "success") return auth
  let output = { status: "error", message: "default redfishRequest object" }

  if (auth.oem === "Dell") {
    output = await dell_query(auth)
  } else if (auth.oem === "Supermicro") {
    output = { status: "error", message: "Supermicro nodes are not supported yet", silent: true }
  } else if (auth.oem === "HPE") {
    output = { status: "error", message: "HPE nodes are not supported yet", silent: true }
  } else return { status: "error", message: "Failed to parse OEM from Redfish request" }

  let logout_res = await redfish_logout(auth.location, url, auth.token)
  if (logout_res.status !== 200) {
    let error = await logout_res.json()
    let extended = error.error["@Message.ExtendedInfo"] !== undefined ? error.error["@Message.ExtendedInfo"] : ""
    console.error(`Failed to logout of ${node}'s bmc`, error, extended) // Catch logout errors
  }
  return output
}

module.exports = {
  api_request,
  redfishRequest,
}
