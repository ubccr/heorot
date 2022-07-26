const fetch = require("node-fetch")
const https = require("https")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

async function api_request(url, token, method = "GET") {
  try {
    let header = {
      method: method,
      headers: { "X-Auth-Token": token, "content-type": "application/json" },
      agent,
    }
    let res = new Object()
    if (typeof url === "string") {
      // Single request
      let res_promise = await fetch(url, header)
      res = await res_promise.json()
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

module.exports = {
  api_request,
}
