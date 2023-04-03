import config from "../../config/config.js"
import express from "express"
import fetch from "node-fetch"
import https from "https"
const app = express.Router()


const agent = new https.Agent({
  rejectUnauthorized: false,
})

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/openmanage" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/openmanage/",
    availibleRoutes: routes,
  })
})

app.get("/nodes", async (req, res) => {
  let warningNodes: any = []
  let criticalNodes: any = []
  let url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 3000`
  let warningRes = await apiRequest(config.settings.openmanage.address + url)
  url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 4000`
  let criticalRes = await apiRequest(config.settings.openmanage.address + url)
  if (warningRes.status === "success") {
    warningRes.result.forEach((element: any) => {
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
    criticalRes.result.forEach((element: any) => {
      criticalNodes.push({
        id: element.Id,
        deviceName: element.DeviceManagement[0].InstrumentationName,
        bmcName: element.DeviceManagement[0].DnsName,
        serviceTag: element.DeviceServiceTag,
        status: element.Status,
      })
    })
  }
  if (warningRes.status === "success" && criticalRes.status === "success") {
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
  const url = config.settings.openmanage.address + "/api/DeviceService/Devices(" + req.params.id + ")/SubSystemHealth"

  try {
    let api_res = await apiRequest(url)

    if (api_res.status === "error" || api_res.result === undefined)
      throw {
        status: "error",
        message: `Error fetching SubSystemHealth for ID: ${req.params.id}`,
      }
    let output: any = { status: "success", result: {} }
    api_res.result.forEach((element: any) => {
      let fault = null
      if (element.FaultList !== undefined) fault = element.FaultList[0].Message
      output.result[element.SubSystem] = {
        subSystem: element.SubSystem,
        status: icons(element.RollupStatus),
        message: fault,
      }
    })
    res.json(output)
  } catch (error) {
    res.json(error)
  }
})

function icons(status: string) {
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

async function apiRequest(url: string) {
  let omeEncoded = Buffer.from(
    config.settings.openmanage.username + ":" + config.settings.openmanage.password
  ).toString("base64")
  let omeAuth = "Basic " + omeEncoded
  let http_header = {
    headers: {
      method: "GET",
      Authorization: omeAuth,
      credentials: "include",
    },
    agent,
  }
  try {
    let fetch_res = await fetch(url, http_header)
    const json_res: any = await fetch_res.json()
    return {
      status: "success",
      result: json_res.value,
    }
  } catch (error) {
    return {
      status: "error",
      message: "API Request error",
      error,
    }
  }
}
export default app
