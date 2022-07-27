const { api_request } = require("./redfish")

async function dell_managers(uri, token) {
  try {
    const urls = [
      uri + "/redfish/v1/Managers/iDRAC.Embedded.1",
      uri + "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces",
    ]
    let res = await api_request(urls, token)
    res.data.forEach((val) => {
      if (val.hasOwnProperty("error"))
        throw val.error["@Message.ExtendedInfo"][0].Message
    })

    tmp_url = uri + res.data[1].Members[0]["@odata.id"]
    let res2 = await api_request(tmp_url, token)
    if (res2.status === "error")
      throw res2.error["@Message.ExtendedInfo"][0].Message
    return {
      status: res.status,
      BMCVersion: res.data[0].FirmwareVersion,
      BMCStatus: res.data[0].Status.Health,
      powerState: res.data[0].PowerState,

      hostName: res2.data.HostName,
      addresses: res2.data.IPv4Addresses,
      NIC: res2.data.Id,
      MAC: res2.data.MACAddress,
      DNS: res2.data.NameServers,
      VLAN: {
        VLANEnabled: res2.data.VLAN.VLANEnabled,
        VLANId: res2.data.VLAN.VLANId,
      },
    }
  } catch (error) {
    let message =
      typeof error === "string" ? error : "Error calling Manager redfish API"
    return {
      status: "error",
      message: message,
      error,
    }
  }
}

async function sm_managers(uri, token) {
  try {
    const urls = [
      uri + "/redfish/v1/Managers/1",
      uri + "/redfish/v1/Managers/1/EthernetInterfaces/1",
    ]
    let res = await api_request(urls, token)
    res.data.forEach((val) => {
      if (val.hasOwnProperty("error"))
        throw val.error["@Message.ExtendedInfo"][0].Message
    })
    return {
      status: "success",
      BMCVersion: res.data[0].FirmwareVersion,
      BMCStatus: res.data[0].Status.Health,
      powerState: null,

      hostName: null,
      addresses: res.data[1].IPv4Addresses,
      NIC: res.data[1].Id,
      MAC: res.data[1].MACAddress,
      DNS: res.data[1].NameServers,
      VLAN: {
        VLANEnabled: res.data[1].VLAN.VLANEnabled,
        VLANId: res.data[1].VLAN.VLANId,
      },
    }
  } catch (error) {
    let message =
      typeof error === "string" ? error : "Error calling Manager redfish API"
    return {
      status: "error",
      message: message,
      error,
    }
  }
}

async function hpe_managers(uri, token) {
  try {
    const urls = [
      uri + "/redfish/v1/Managers/1",
      uri + "/redfish/v1/Managers/1/EthernetInterfaces",
    ]
    let res = await api_request(urls, token)
    res.data.forEach((val) => {
      if (val.hasOwnProperty("error"))
        throw val.error["@Message.ExtendedInfo"][0].Message
    })

    let active_int = res.data[1].Items.map((val) => {
      if (val.SpeedMbps !== null) return val
    }).filter(Boolean)[0] // Limit to first connected interface

    return {
      status: "success",
      BMCVersion: res.data[0].FirmwareVersion,
      BMCStatus: res.data[0].Status.Health,
      powerState: null,

      hostName: active_int.HostName,
      addresses: active_int.IPv4Addresses,
      NIC: active_int.Id,
      MAC: active_int.MACAddress,
      DNS: active_int.NameServers,
      VLAN: {
        VLANEnabled: active_int.VLANEnable,
        VLANId: active_int.VLANId,
      },
    }
  } catch (error) {
    let message =
      typeof error === "string" ? error : "Error calling GPU redfish API"
    return {
      status: "error",
      message: message,
      error,
    }
  }
}

module.exports = {
  dell_managers,
  sm_managers,
  hpe_managers,
}
