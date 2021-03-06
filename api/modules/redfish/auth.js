const fetch = require("node-fetch")
const https = require("https")

let config = require("../../config")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

async function redfish_auth(uri) {
  const payload = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserName: config.bmc.DELL_USER,
      Password: config.bmc.DELL_PASS,
    }),
    agent,
  }

  const header = {
    agent,
  }
  const urls = [
    `${uri}/redfish/v1/SessionService/Sessions`,
    `${uri}/redfish/v1`,
  ]
  try {
    let res_promise = await Promise.all([
      await fetch(urls[0], payload),
      await (await fetch(urls[1], header)).json(),
    ])

    let token = res_promise[0].headers.get("x-auth-token")
    let status = token !== null ? "success" : "error"
    let OEM = new String()
    const resOEM = res_promise[1].Oem ?? { Dell: "" } // Best Guess
    if (Object.keys(resOEM).length === 0 || resOEM.hasOwnProperty("Supermicro"))
      // pesky bugged out SM api
      OEM = "Supermicro"
    else if (resOEM.hasOwnProperty("Dell")) OEM = "Dell"
    else if (resOEM.hasOwnProperty("Hp")) OEM = "HPE"

    if (status === "success") {
      return {
        status: status,
        token: token,
        location: res_promise[0].headers.get("location"),
        version: res_promise[1].RedfishVersion,
        oem: OEM,
        uri: uri,
      }
    } else {
      let error = await res_promise[0].json()
      return {
        status: "error",
        message: "Error authenticating to BMC",
        error: error.error,
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      error,
    }
  }
}

async function redfish_logout(url, uri, token) {
  let logout_url = new String()

  // One of these vendors is not like the others... *cough* HPE
  if (url.slice(0, 1) === "/") {
    logout_url = uri + url
  } else {
    logout_url = url
  }
  let header = {
    method: "DELETE",
    headers: { "X-Auth-Token": token },
    agent,
  }
  return await fetch(logout_url, header)
}

module.exports = {
  redfish_auth,
  redfish_logout,
}
