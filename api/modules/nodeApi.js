const fetch = require("node-fetch")
const https = require("https")

const api_user = process.env.JS_DELL_BMC_USERNAME
const api_pass = process.env.JS_DELL_BMC_PASSWORD

const agent = new https.Agent({
  rejectUnauthorized: false,
})
let encoded = Buffer.from(api_user + ":" + api_pass).toString("base64")
let auth = "Basic " + encoded
let header = {
  headers: {
    method: "GET",
    Authorization: auth,
    credentials: "include",
  },
  agent,
}

async function apiClearSEL(node) {
  const apiUrl = `https://${node}/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Actions/LogService.ClearLog`

  let payload = {
    method: "POST",
    headers: {
      Authorization: auth,
      "content-type": "application/json",
    },
    agent,
  }
  try {
    let fetch_res = await fetch(apiUrl, payload)
    return {
      status: "success",
      message: "System Event Log cleared",
      color: "success",
      result: fetch_res,
    }
  } catch (error) {
    return {
      status: "failed",
      message: "API error",
      color: "error",
      error,
    }
  }
}

async function apiResetBMC(node) {
  const apiUrl = `https://${node}/redfish/v1/Managers/iDRAC.Embedded.1/Actions/Manager.Reset`

  let payload = {
    method: "POST",
    headers: {
      Authorization: auth,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ResetType: "GracefulRestart",
    }),
    agent,
  }

  try {
    let fetch_res = await fetch(apiUrl, payload)
    return {
      status: "success",
      message: "BMC sent reset command",
      result: fetch_res,
      color: "success",
    }
  } catch (error) {
    return {
      status: "failed",
      message: "API error",
      color: "error",
      error,
    }
  }
}

async function biosApi(node) {
  const api_url =
    "https://" + node + "/redfish/v1/Systems/System.Embedded.1/Bios"

  try {
    fetch_res = await fetch(api_url, header)
    const json_res = await fetch_res.json()
    if (json_res.Id === "Bios") {
      return {
        message: "success",
        Model: json_res.Attributes.SystemModelName,
        BiosVersion: json_res.Attributes.SystemBiosVersion,
        ServiceTag: json_res.Attributes.SystemServiceTag,
        MemorySize: json_res.Attributes.SysMemSize,
        CPU1: json_res.Attributes.Proc1Brand,
        CPU2: json_res.Attributes.Proc2Brand,
        BootOrder: json_res.Attributes.SetBootOrderEn,
      }
    } else {
      return {
        status: "failed",
        message: "BIOS API error",
        error: json_res.error["@Message.ExtendedInfo"][0].Message,
      }
    }
  } catch (error) {
    return {
      status: "failed",
      message: "BIOS API error",
      error: error.message,
    }
  }
}

async function idracApi(node) {
  try {
    let api_url = "https://" + node + "/redfish/v1/Managers/iDRAC.Embedded.1"
    fetch_res = await fetch(api_url, header)
    const json_res = await fetch_res.json()

    next_url = await apiRequest(
      "https://" +
        node +
        "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces",
      header
    )
    let json_res1 = new Object()

    if (typeof next_url.json_res.Members[0]["@odata.id"] != "undefined")
      next_url_res = await apiRequest(
        "https://" + node + next_url.json_res.Members[0]["@odata.id"],
        header
      )
    json_res1 = next_url_res.json_res

    bmc = new Object()

    if (next_url_res.message != "error") {
      bmc.message = "success"
      if (json_res1.VLAN.VLANEnable == true) bmc.vlan = json_res1.VLAN.VLANId
      else bmc.vlan = "false"
    } else {
      bmc.error += "BMC NIC url invalid"
    }

    if (json_res.Id === "iDRAC.Embedded.1") {
      bmc.message = "success"
      bmc.Health = json_res.Status.Health
      bmc.Firmware = json_res.FirmwareVersion
    } else {
      bmc.message = "BMC API error"
      bmc.error = json_res.error["@Message.ExtendedInfo"][0].Message
    }
    return bmc
  } catch (error) {
    return {
      status: "failed",
      message: "BMC API error",
      error: error.message,
    }
  }
}

async function gpuApi(node) {
  let api_url = "https://" + node + "/redfish/v1/Systems/System.Embedded.1"
  try {
    let fetch_res1 = await fetch(api_url, header)
    let json_res1 = await fetch_res1.json()

    if (json_res1.Links.Oem.hasOwnProperty("Dell")) {
      api_url =
        "https://" +
        node +
        "/redfish/v1/Systems/System.Embedded.1/Oem/Dell/DellVideo"
      try {
        fetch_res = await fetch(api_url, header)
        const json_res = await fetch_res.json()
        let node = {
          count: 0,
          GPUs: [],
        }
        if (json_res.Name === "DellVideoCollection") {
          json_res.Members.forEach(function (val, index) {
            if (val.MarketingName !== null) {
              node.count++
              node.GPUs.push({
                Id: val.Id,
                Name: val.MarketingName,
                Health: val.GPUHealth,
              })
            }
          })
          node.status = "success"
          node.message = "GPU tag found"
          return node
        } else {
          return {
            status: "failed",
            message: "GPU API error",
            error: json_res.error["@Message.ExtendedInfo"][0].Message,
          }
        }
      } catch (error) {
        return {
          status: "failed",
          message: "GPU API error",
          error: error.message,
        }
      }
    } else {
      return {
        status: "failed",
        message: "GPU API error",
        error: "node incompatible with GPU query",
        ignore: true,
      }
    }
  } catch (error) {
    return {
      status: "failed",
      message: "GPU API error",
      error: error.message,
    }
  }
}

async function sensorsApi(node) {
  let api_url = "https://" + node + "/redfish/v1/Systems/System.Embedded.1"
  try {
    let fetch_res1 = await fetch(api_url, header)
    let json_res1 = await fetch_res1.json()

    if (json_res1.Links.Oem.hasOwnProperty("Dell")) {
      api_url =
        "https://" +
        node +
        "/redfish/v1/Systems/System.Embedded.1/Oem/Dell/DellSensors"
      let nodeInfo = {
        dimms: {},
        processor: {},
        systemBoard: {},
      }
      try {
        do {
          let fetch_res = await fetch(api_url, header)
          let json_res = await fetch_res.json()
          nextLink = json_res["Members@odata.nextLink"]
          api_url = "https://" + node + nextLink

          if (json_res.Name === "DellSensorCollection") {
            json_res.Members.forEach(function (val, index) {
              if (val.HealthState !== "Unknown")
                if (val.ElementName.substring(0, 9) === "DIMM SLOT")
                  nodeInfo.dimms[val.ElementName.substring(10)] =
                    val.HealthState
                else if (val.ElementName.substring(0, 3) === "CPU")
                  nodeInfo.processor[val.ElementName] = val.HealthState
                else if (val.ElementName.substring(0, 12) === "System Board")
                  nodeInfo.systemBoard[val.ElementName] = val.HealthState
                else nodeInfo[val.ElementName] = val.HealthState
              if (val.ElementName.substring(5, 11) === "Status")
                nodeInfo["cpu" + val.ElementName.substring(3, 4)] =
                  val.HealthState
            })
            nodeInfo.memory = json_res1.MemorySummary.Status.Health
            nodeInfo.message = "Success"
          } else {
            nodeInfo = {
              status: "failed",
              message: "Sensor API error",
              error: json_res.error["@Message.ExtendedInfo"][0].Message,
            }
          }
        } while (nextLink !== undefined)

        return nodeInfo
      } catch (error) {
        return {
          status: "failed",
          message: "Sensor API error",
          error: error.message,
        }
      }
    } else {
      return {
        memory: json_res1.MemorySummary.Status.Health,
        cpu1: json_res1.ProcessorSummary.Status.Health,
        cpu2: json_res1.ProcessorSummary.Status.Health,
        message: "Success",
      }
    }
  } catch (error) {
    return {
      status: "failed",
      message: "Sensor API error",
      error: error.message,
    }
  }
}

async function selApi(node) {
  let api_url =
    "https://" + node + "/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel?$top=1"

  try {
    count_res = await fetch(api_url, header)
    const count_jres = await count_res.json()
    let sel = {
      entries: [],
    }

    count = count_jres["Members@odata.count"]
    if (count > 10) count = 10
    api_url =
      "https://" +
      node +
      "/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel?$top=" +
      count

    fetch_res = await fetch(api_url, header)
    const json_res = await fetch_res.json()

    if (json_res.Name === "Log Entry Collection") {
      json_res.Members.forEach(function (val, index) {
        let hours = val.Created.substring(11, 13)

        let date =
          val.Created.substring(5, 7) +
          "-" +
          val.Created.substring(8, 10) +
          "-" +
          val.Created.substring(0, 4)
        let time =
          (hours > 12 ? hours - 12 : hours) +
          ":" +
          val.Created.substring(14, 16) +
          ":" +
          val.Created.substring(17, 19) +
          " " +
          (hours >= 12 ? "pm" : "am")

        sel.entries[index] = {
          id: index,
          date: date,
          time: time,
          message: val.Message,
          type: val.SensorType,
          severity: val.Severity,
        }
      })
      return {
        message: "success",
        sel,
      }
    } else {
      return {
        status: "failed",
        message: "SEL API error",
        error: json_res.error["@Message.ExtendedInfo"][0].Message,
      }
    }
  } catch (error) {
    return {
      status: "failed",
      message: "SEL API error",
      error: error.message,
    }
  }
}

async function apiRequest(url, http_header) {
  try {
    let fetch_res = await fetch(url, http_header)
    const json_res = await fetch_res.json()
    return {
      message: "success",
      json_res,
    }
  } catch (error) {
    return {
      status: "failed",
      message: "API error",
      error,
    }
  }
}

module.exports = {
  biosApi,
  idracApi,
  gpuApi,
  sensorsApi,
  selApi,
  apiClearSEL,
  apiResetBMC,
}
