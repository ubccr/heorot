const fetch = require("node-fetch")
const https = require("https")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

async function api_request(url, auth, method = "GET", json = true, body = undefined) {
  try {
    let header = {
      method: method,
      headers: { "X-Auth-Token": auth.token, "content-type": "application/json" },
      body,
      agent,
    }
    let res = new Object()
    if (typeof url === "string") {
      // Single request
      let res_promise = await fetch(auth.uri + url, header)

      if (json === true) res = await res_promise.json()
      else res = res_promise
      if (res.hasOwnProperty("error")) throw res.error
    } else if (typeof url === "object") {
      // Parallel requests
      res = await Promise.all(
        url.map(async (u) => {
          const res = await fetch(auth.uri + u, header)
          if (json === true && res.status === 200) return await res.json()
          else return res
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

module.exports = { api_request }
