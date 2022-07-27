const { api_request } = require("./redfish")

async function dell_resetBmc(uri, token) {
  const body = JSON.stringify({ ResetType: "GracefulRestart" })
  const url =
    uri + "/redfish/v1/Managers/iDRAC.Embedded.1/Actions/Manager.Reset"

  let res = await api_request(url, token, "POST", false, body)
  if (res.data.status === 204) {
    return {
      status: "success",
      message: "BMC rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error resetting BMC",
    }
  }
}

async function sm_resetBmc(uri, token) {
  const body = JSON.stringify({ ResetType: "GracefulRestart" })
  const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset"
  let res = await api_request(url, token, "POST", false, body)
  console.log(res)
  if (res.data.status === 200) {
    return {
      status: "success",
      message: "BMC rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error resetting BMC",
    }
  }
}

async function hpe_resetBmc(uri, token) {
  const body = JSON.stringify({ Action: "Reset" })
  const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset/"
  let res = await api_request(url, token, "POST", false, body)

  if (res.data.status === 200) {
    return {
      status: "success",
      message: "BMC rebooting momentarily",
    }
  } else {
    return {
      status: "error",
      message: "Error resetting BMC",
    }
  }
}

module.exports = {
  dell_resetBmc,
  sm_resetBmc,
  hpe_resetBmc,
}
