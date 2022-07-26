const fetch = require("node-fetch")
const https = require("https")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

async function api_request(url, token) {
  try {
    let header = {
      headers: { method: "GET", "X-Auth-Token": token },
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
