const express = require("express")
const app = express.Router()
const https = require("https")
const fetch = require("node-fetch")

// TODO: deprecate
// const { validate } = require("../models/User")

let config = require("../config")

const agent = new https.Agent({
  rejectUnauthorized: false,
})
let omeEncoded = Buffer.from(config.ome.user + ":" + config.ome.pass).toString(
  "base64"
)
let omeAuth = "Basic " + omeEncoded
let omeHeader = {
  headers: {
    method: "GET",
    Authorization: omeAuth,
    credentials: "include",
  },
  agent,
}

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/grendel/",
    availibleRoutes: routes,
  })
})

app.get("/nodes", async (req, res) => {
  let warningNodes = []
  let criticalNodes = []
  let url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 3000`
  let warningRes = await apiRequest(config.ome.url + url, omeHeader)
  url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 4000`
  let criticalRes = await apiRequest(config.ome.url + url, omeHeader)
  if (warningRes.status === "success") {
    warningRes.result.forEach((element) => {
      warningNodes.push({
        id: element.Id,
        deviceName: element.DeviceManagement[0].InstrumentationName,
        serviceTag: element.DeviceServiceTag,
        status: element.Status,
        bmcName: element.DeviceManagement[0].DnsName,
      })
    })
  }
  if (criticalRes.status === "success") {
    criticalRes.result.forEach((element) => {
      criticalNodes.push({
        id: element.Id,
        deviceName: element.DeviceManagement[0].InstrumentationName,
        bmcName: element.DeviceManagement[0].DnsName,
        serviceTag: element.DeviceServiceTag,
        status: element.Status,
      })
    })
  }
  if ((warningRes.status === "success") & (criticalRes.status === "success")) {
    res.json({ status: "success", result: { warningNodes, criticalNodes } })
  } else {
    res.json({
      status: "error",
      message: "OME API call error",
      error: warningRes,
      criticalRes,
    })
  }
})

app.get("/health/:id", async (req, res) => {
  let json = new Object()
  const url =
    config.ome.url +
    "/api/DeviceService/Devices(" +
    req.params.id +
    ")/SubSystemHealth"

  json = await apiRequest(url, omeHeader)
  let output = { status: "error", result: {} }
  if (json.status === "success") {
    output.status = "success"
    let list = json.result

    list.forEach((element) => {
      let fault = null
      if (element.FaultList !== undefined) fault = element.FaultList[0].Message
      output.result[element.SubSystem] = {
        subSystem: element.SubSystem,
        status: icons(element.RollupStatus),
        message: fault,
      }
    })
    res.send(output)
  } else {
    res.send(json)
  }
})

function icons(status) {
  if (status === "4000") {
    return "Critical"
  } else if (status === "3000") {
    return "Warning"
  } else if (status === "1000") {
    return "Good"
  } else {
    return "Unknown"
  }
}

async function apiRequest(url, http_header) {
  try {
    let fetch_res = await fetch(url, http_header)
    const json_res = await fetch_res.json()
    return {
      status: "success",
      result: json_res.value,
    }
  } catch (error) {
    console.error(error)
    return {
      status: "error",
      message: "API Request error",
      error,
    }
  }
}
module.exports = app
