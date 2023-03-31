const { api_request } = require("../redfish")

const body = JSON.stringify({ Action: "ClearLog" })

async function dell_clearSel(uri, token) {
  const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Actions/LogService.ClearLog"
  try {
    let res = await api_request(url, token, "POST", false, body)
    return {
      status: res.status,
      message: "System Event Log successfully cleared",
    }
  } catch (error) {
    return {
      status: "error",
      message: "Error clearing SEL",
      error,
    }
  }
}

async function sm_clearSel(uri, token) {
  const url = uri + "/redfish/v1/Systems/1/LogServices/Log1/Actions/LogService.ClearLog"
  try {
    let res = await api_request(url, token, "POST", false, body)
    return {
      status: res.status,
      message: "System Event Log successfully cleared",
    }
  } catch (error) {
    return {
      status: "error",
      message: "Error clearing SEL",
      error,
    }
  }
}

async function hpe_clearSel(uri, token) {
  const url = uri + "/redfish/v1/Systems/1/LogServices/IML/Actions/LogService.ClearLog/"
  try {
    let res = await api_request(url, token, "POST", false, body)
    return {
      status: res.status,
      message: "System Event Log successfully cleared",
    }
  } catch (error) {
    return {
      status: "error",
      message: "Error clearing SEL",
      error,
    }
  }
}

module.exports = {
  dell_clearSel,
  sm_clearSel,
  hpe_clearSel,
}
