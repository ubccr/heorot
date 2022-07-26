const { api_request } = require("./redfish")

async function dell_clearSel(uri, token) {
  const url =
    uri +
    "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Actions/LogService.ClearLog"

  await api_request(url, token, "POST")
  return {
    status: "success",
    message: "System Event Log successfully cleared",
  }
}

async function sm_clearSel(uri, token) {
  const url =
    uri + "/redfish/v1/Systems/1/LogServices/IML/Actions/LogService.ClearLog"
}

async function hpe_clearSel(uri, token) {
  const url =
    uri + "/redfish/v1/Systems/1/LogServices/Log1/Actions/LogService.ClearLog"
}

module.exports = {
  dell_clearSel,
  sm_clearSel,
  hpe_clearSel,
}
