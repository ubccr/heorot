const { api_request } = require("./redfish")

async function dell_resetNode(uri, token) {
  const url =
    uri + "/redfish/v1/Systems/System.Embedded.1/Actions/ComputerSystem.Reset"
  const body = JSON.stringify({ ResetType: "PowerCycle" })
  let res = await api_request(url, token, "POST", false, body)
  if (res.data.status === 204) {
    return {
      status: "success",
      message: "Node rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error rebooting the Node",
    }
  }
}

async function sm_resetNode(uri, token) {
  const body = JSON.stringify({ ResetType: "ForceRestart" })
  const url = uri + "/redfish/v1/Systems/1/Actions/ComputerSystem.Reset"
  let res = await api_request(url, token, "POST", false, body)
  if (res.data.status === 200) {
    return {
      status: "success",
      message: "Node rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error rebooting the Node",
    }
  }
}

async function hpe_resetNode(uri, token) {
  const body = JSON.stringify({ ResetType: "ForceRestart" })
  const url = uri + "/redfish/v1/Systems/1/Actions/ComputerSystem.Reset"
  let res = await api_request(url, token, "POST", false, body)
  if (res.data.status === 200) {
    return {
      status: "success",
      message: "Node rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error rebooting the Node",
    }
  }
}

module.exports = {
  dell_resetNode,
  sm_resetNode,
  hpe_resetNode,
}
