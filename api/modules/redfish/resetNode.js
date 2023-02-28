const { api_request } = require("./redfish")

async function dell_resetNode(uri, token, pxe) {
  if (pxe === "true") {
    const pxe_url = uri + "/redfish/v1/Systems/System.Embedded.1"
    const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } })
    let pxe_res = await api_request(pxe_url, token, "PATCH", false, pxe_body)
    if (pxe_res.data.status !== 200) {
      return {
        status: "error",
        message: "Error setting PXE boot override",
      }
    }
  }

  const reset_url = uri + "/redfish/v1/Systems/System.Embedded.1/Actions/ComputerSystem.Reset"
  const reset_body = JSON.stringify({ ResetType: "ForceRestart" })
  let reset_res = await api_request(reset_url, token, "POST", false, reset_body)
  if (reset_res.data.status === 204) {
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

async function sm_resetNode(uri, token, pxe) {
  if (pxe) {
    const pxe_url = uri + "/redfish/v1/Systems/1"
    const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } })
    let pxe_res = await api_request(pxe_url, token, "PATCH", false, pxe_body)
    if (pxe_res.data.status !== 200) {
      return {
        status: "error",
        message: "Error setting PXE boot override",
      }
    }
  }

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

async function hpe_resetNode(uri, token, pxe) {
  if (pxe) {
    const pxe_url = uri + "/redfish/v1/Systems/1"
    const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } })
    let pxe_res = await api_request(pxe_url, token, "PATCH", false, pxe_body)
    if (pxe_res.data.status !== 200) {
      return {
        status: "error",
        message: "Error setting PXE boot override",
      }
    }
  }

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
