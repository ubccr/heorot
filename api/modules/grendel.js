const { default: got } = require("got")

let config = require("../config")

async function grendelRequest(path, method = "GET", body = {}) {
  try {
    let response = {}
    switch (method) {
      case "GET":
        response = await got(`unix:${config.grendel.socket}:${path}`)
        break
      case "PUT":
        response = await got.put(`unix:${config.grendel.socket}:${path}`)
        break
      case "POST":
        response = await got.post(`unix:${config.grendel.socket}:${path}`, {
          json: body,
        })
        break
      case "DELETE":
        response = await got.delete(`unix:${config.grendel.socket}:${path}`)
        break
    }
    return { status: "success", result: JSON.parse(response.body) }
  } catch (err) {
    if (err.code === "ENOENT" && err.response === undefined) {
      return {
        status: "error",
        result: { message: "Grendel API connection failed" },
        code: err.code,
      }
    } else if (err.code === "EACCES" && err.response === undefined) {
      return {
        status: "error",
        result: { message: "Grendel API socket permission error" },
        code: err.code,
      }
    } else if (err.response !== undefined) {
      return {
        status: "error",
        result: JSON.parse(err.response.body),
        code: err.code,
      }
    } else {
      return {
        status: "error",
        result: err,
        code: err.code,
      }
    }
  }
}
async function getBMC(node) {
  let bmcInterface = ""
  let grendelRes = await grendelRequest(`/v1/host/find/${node}`)
  if (grendelRes.result.length > 0) {
    let grendelNode = grendelRes.result[0]
    grendelNode.interfaces.forEach((element) => {
      if (element.bmc === true) {
        if (element.fqdn !== "") bmcInterface = element.fqdn
        else bmcInterface = element.ip
      }
    })

    return {
      status: grendelRes.status,
      address: bmcInterface,
      node: grendelNode,
    }
  } else {
    return {
      status: "error",
      message: `No hosts matching ${node} found`,
    }
  }
}
module.exports = { grendelRequest, getBMC }
