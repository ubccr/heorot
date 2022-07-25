const fetch = require("node-fetch")
const https = require("https")

let config = require("../config")

const agent = new https.Agent({
  rejectUnauthorized: false,
})

// Looks at "Oem" property of redfish default route | empty = SM, Dell = Dell, etc
async function fetchOEM(bmcAddr) {
  const uri = `https://${bmcAddr}`
  const url = `${uri}/redfish/v1/`
  let apiRes = await api_request(url, uri)
  let OEM = ""
  if (apiRes.status === "success") {
    const resOEM = apiRes.data.Oem ?? { Dell: "" } // Best Guess

    if (Object.keys(resOEM).length === 0 || resOEM.hasOwnProperty("Supermicro"))
      // pesky bugged out SM api
      OEM = "Supermicro"
    else if (resOEM.hasOwnProperty("Dell")) OEM = "Dell"
    else if (resOEM.hasOwnProperty("Hp")) OEM = "HPE"

    return {
      status: apiRes.status,
      OEM: OEM,
      version: apiRes.data.RedfishVersion,
      address: bmcAddr,
    }
  } else {
    return apiRes
  }
}

// Dell
async function dell_systems(uri) {
  const url = uri + "/redfish/v1/Systems/System.Embedded.1"
  const bios_url = url + "/Bios"

  let res = await api_request(url, uri)
  let res2 = await api_request(bios_url, uri)

  let bootArr =
    res.data.Boot.BootOrder === undefined
      ? null
      : res.data.Boot.BootOrder.join(",")
  let bootOrder =
    res2.data.Attributes.SetBootOrderEn !== undefined
      ? res2.data.Attributes.SetBootOrderEn
      : bootArr
  return {
    status: res.status,
    hostStatus: res.data.Status.Health,
    model: res.data.Model,
    serviceTag: res.data.SKU,
    biosVersion: res.data.BiosVersion,
    manufacturer: res.data.Manufacturer,
    bootOrder: bootOrder,
    hostName: res.data.HostName,
    memoryStatus: res.data.MemorySummary.Status.Health,
    totalMemory: res.data.MemorySummary.TotalSystemMemoryGiB,
    memorySpeed: res2.data.Attributes.SysMemSpeed,

    processorModel: res.data.ProcessorSummary.Model,
    processorCount: res.data.ProcessorSummary.Count,
    processorCores:
      res.data.ProcessorSummary.LogicalProcessorCount /
      res.data.ProcessorSummary.Count,
    processorStatus: res.data.ProcessorSummary.Status.Health,

    logicalProc: res2.data.Attributes.LogicalProc,
    pxeDevice1: res2.data.Attributes.PxeDev1Interface ?? null,
    pxeDevice1Enabled: res2.data.Attributes.PxeDev1EnDis ?? null,
    powerRecovery: res2.data.Attributes.AcPwrRcvry,
  }
}

async function dell_managers(uri) {
  // 1st call
  const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1"
  let res = await api_request(url, uri)
  // 2nd call
  let tmp_url = url + "/EthernetInterfaces"
  let tmp_res = await api_request(tmp_url, uri)
  tmp_url = uri + tmp_res.data.Members[0]["@odata.id"]
  let res2 = await api_request(tmp_url, uri)

  return {
    status: res.status,
    BMCVersion: res.data.FirmwareVersion,
    BMCStatus: res.data.Status.Health,
    powerState: res.data.PowerState,

    hostName: res2.data.HostName,
    addresses: res2.data.IPv4Addresses,
    NIC: res2.data.Id,
    MAC: res2.data.MACAddress,
    DNS: res2.data.NameServers,
    VLAN: res2.data.VLAN,
  }
}

async function dell_gpu(uri, version) {
  let versionArr = version.split(".")
  if (versionArr[0] > 1 || versionArr[1] > 4) {
    // Redfish version higher than 1.4
    let tmp_url = uri + "/redfish/v1/Systems/System.Embedded.1/Processors"
    let tmp_res = await api_request(tmp_url, uri)
    if (tmp_res.status === "success") {
      let all_gpus = new Array()
      let physical_gpus = new Array()

      tmp_res.data.Members.forEach((val) => {
        if (val["@odata.id"].substring(49, 54) === "Video")
          all_gpus.push(uri + val["@odata.id"])
        if (
          val["@odata.id"].substring(49, 54) === "Video" &&
          val["@odata.id"].substring(61, 63) === "-1"
        )
          physical_gpus.push(uri + val["@odata.id"])
      })
      let gpu_res = await api_request(physical_gpus, uri)
      let gpus = gpu_res.data.map((val) => {
        return {
          GPUStatus: val.Status === null ? "Unknown" : val.Status.Health,
          manufacturer: val.Manufacturer,
          model: val.Model,
        }
      })
      return {
        status: "success",
        vGPU: physical_gpus.length === all_gpus.length ? false : true,
        physical: physical_gpus.length,
        virtual: all_gpus.length,
        GPUs: gpus,
      }
    } else {
      return {
        tmp_res,
      }
    }
  } else {
    // Redfish version 1.4 and lower
    let tmp_url = uri + "/redfish/v1/Systems/System.Embedded.1"
    let tmp_res = await api_request(tmp_url, uri)
    if (tmp_res.status === "success") {
      let pci_urls = tmp_res.data.PCIeDevices.map((val) => {
        return uri + val["@odata.id"]
      })
      let pci_res = await api_request(pci_urls, uri)
      let gpus = pci_res.data
        .map((val) => {
          if (val.Manufacturer === "NVIDIA Corporation")
            return {
              GPUStatus: val.Status.Health,
              manufacturer: val.Manufacturer,
              model: val.Name,
            }
        })
        .filter(Boolean)
      return {
        status: "success",
        vGPU: null,
        physical: gpus.length,
        virtual: gpus.length,
        GPUs: gpus,
      }
    }
  }
}

async function dell_storage(uri, version) {
  let tmp_url = uri + "/redfish/v1/Systems/System.Embedded.1/Storage"
  let tmp_res = await api_request(tmp_url, uri)
  if (tmp_res.status === "success") {
    const urls = tmp_res.data.Members.map((val) => {
      return uri + val["@odata.id"]
    })

    tmp_res = await api_request(urls, uri)

    // Find the Storage Controller containing Drives
    let res = tmp_res.data
      .map((val) => {
        if (val.Drives.length > 0) return val
      })
      .filter(Boolean)[0]
    res.status = tmp_res.status
    let storageController = res.StorageControllers[0] ?? null

    // Enclosure - Cannot find redfish route on -v1.4.0 nodes 😞
    // All of this just to get total enclosure disk count
    let versionArr = version.split(".")
    if (versionArr[0] > 1 || versionArr[1] > 4) {
      tmp_url = res.Links.Enclosures.map((val) => {
        let url_arr = val["@odata.id"].split("/")
        if (url_arr[4].substring(0, 3) === "Enc") return uri + val["@odata.id"]
      }).filter(Boolean)[0]

      let enclosure_res = await api_request(tmp_url, uri)
      res.slotCount = enclosure_res.data.Oem.Dell.DellEnclosure.SlotCount
    } else res.slotCount = null

    // Volumes
    tmp_url = uri + res.Volumes["@odata.id"]
    tmp_res = await api_request(tmp_url, uri)

    let volume_urls = tmp_res.data.Members.map((val) => uri + val["@odata.id"])
    let volume_res = await api_request(volume_urls, uri)
    let volumes = volume_res.data.map((val) => {
      let capacity =
        val.CapacityBytes > 1000000000000
          ? (val.CapacityBytes / 1100000000000).toPrecision(3) + " TiB"
          : (val.CapacityBytes / 1074000000).toPrecision(3) + " GiB"
      return {
        name: val.Name,
        driveStatus: val.Status.Health,
        RAIDType: val.RAIDType,
        capacity: capacity,
      }
    })

    // Drives
    let tmp2_urls = res.Drives.map((val) => uri + val["@odata.id"])
    let tmp2_res = await api_request(tmp2_urls, uri)
    let drives = tmp2_res.data.map((val) => {
      let capacity =
        val.CapacityBytes > 1000000000000
          ? (val.CapacityBytes / 1100000000000).toPrecision(3) + " TiB"
          : (val.CapacityBytes / 1074000000).toPrecision(3) + " GiB"
      return {
        blockSize: val.BlockSizeBytes,
        capableSpeed: val.CapableSpeedGbs,
        capacity: capacity,
        description: val.Description,
        failurePredicted: val.FailurePredicted,
        hotspareType: val.HotspareType,
        id: val.Id,
        manufacturer: val.Manufacturer,
        mediaType: val.MediaType,
        model: val.Model,
        name: val.Name,
        negotiatedSpeed: val.NegotiatedSpeed,
        protocol: val.Protocol,
        rotationSpeed: val.RotationSpeedRPM,
        serialNumber: val.SerialNumber,
        driveStatus: val.Status.Health,
      }
    })
    return {
      status: res.status,
      slotCount: res.slotCount,
      driveCount: res["Drives@odata.count"],
      controller: storageController.Name,
      cardStatus: storageController.Status.Health,
      firmware: storageController.FirmwareVersion,
      speed: storageController.SpeedGbps ?? null,
      volumes: volumes,
      drives: drives,
    }
  } else {
    return tmp_res
  }
}

async function dell_sel(uri) {
  let top = "20"
  let url =
    uri +
    `/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Entries/?$top=${top}`

  let res = await api_request(url, uri)
  if (res.status === "success") {
    return {
      status: res.status,
      count: res.data["Members@odata.count"],
      logs: res.data.Members.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }),
    }
  } else {
    top = res.error["@Message.ExtendedInfo"][0].MessageArgs[2]
      .replace(")", "")
      .split("-")[1]
    url =
      uri +
      `/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Entries/?$top=${top}`

    res = await api_request(url, uri)
    return {
      status: res.status,
      count: res.data["Members@odata.count"],
      logs: res.data.Members.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }),
    }
  }
}

// Supermicro
async function sm_systems(uri) {
  const urls = [
    uri + "/redfish/v1/Systems/1",
    uri + "/redfish/v1/Systems/1/Processors/1",
    uri + "/redfish/v1/Systems/1/Memory/1",
  ]
  let res = await api_request(urls, uri)

  if (res.status === "success") {
    return {
      status: "success",
      hostStatus: res.data[0].Status.Health,
      model: res.data[0].Model,
      serviceTag: res.data[0].SKU,
      biosVersion: res.data[0].BiosVersion,
      manufacturer: res.data[0].Manufacturer,
      bootOrder: null,
      hostName: null,
      memoryStatus: res.data[0].MemorySummary.Status.Health,
      totalMemory: res.data[0].MemorySummary.TotalSystemMemoryGiB,
      memorySpeed: res.data[2].OperatingSpeedMhz + " Mhz",

      processorModel: res.data[1].Model,
      processorCount: res.data[0].ProcessorSummary.Count,
      processorCores: res.data[1].TotalCores,
      processorStatus: res.data[0].ProcessorSummary.Status.Health,
      logicalProc:
        res.data[1].TotalCores !== res.data[1].TotalThreads
          ? "Enabled"
          : "Disabled",
      pxeDevice1: null,
      pxeDevice1Enabled: null,
      powerRecovery: null,
    }
  } else return res
}
async function sm_managers(uri) {
  const urls = [
    uri + "/redfish/v1/Managers/1",
    uri + "/redfish/v1/Managers/1/EthernetInterfaces/1",
  ]
  let res = await api_request(urls, uri)
  if (res.status === "success") {
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
      VLAN: res.data[1].VLAN,
    }
  } else return res
}

async function sm_gpu(uri) {
  const url = uri + "/redfish/v1/Chassis/1/PCIeDevices"
  let res = await api_request(url, uri)
  if (res.status === "success") {
    let gpu_urls = res.data.Members.map((val) => {
      let url_arr = val["@odata.id"].split("/")
      if (url_arr[6].substring(0, 3) === "GPU")
        return uri + val["@odata.id"] + "/PCIeFunctions/1"
    }).filter(Boolean)

    let gpu_res = await api_request(gpu_urls, uri)

    let gpus = gpu_res.data.map((val) => {
      return {
        GPUStatus: val.Status.Health,
        manufacturer: val.Oem.Supermicro.GPUDevice.GPUVendor,
        model: val.Oem.Supermicro.GPUDevice.GPUModel,
      }
    })
    return {
      status: "success",
      vGPU: null,
      physical: gpu_urls.length,
      virtual: null,
      GPUs: gpus,
    }
  } else return res
}

async function sm_storage(uri) {
  // Cannot implement without a license 😞
  return {
    status: "error",
    message: "Storage request not implemented on Supermicro nodes",
  }
}

async function sm_sel(uri) {
  const url = uri + "/redfish/v1/Systems/1/LogServices/IML/Entries/?$top=20"

  let res = await api_request(url, uri)

  if (res.status === "success") {
    return {
      status: res.status,
      count: res.data["Members@odata.count"],
      logs: res.data.Members.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }),
    }
  } else return res
}

// HPE
async function hpe_systems(uri) {
  const urls = [
    uri + "/redfish/v1/Systems/1",
    uri + "/redfish/v1/Systems/1/Processors/1",
    uri + "/redfish/v1/Systems/1/Memory/proc1dimm1",
  ]
  let res = await api_request(urls, uri)

  if (res.status === "success") {
    return {
      status: "success",
      hostStatus: res.data[0].Status.Health,
      model: res.data[0].Model,
      serviceTag: res.data[0].SerialNumber,
      biosVersion: res.data[0].BiosVersion,
      manufacturer: res.data[0].Manufacturer,
      bootOrder: null,
      hostName: res.data[0].HostName,
      memoryStatus: res.data[0].MemorySummary.Status.HealthRollUp,
      totalMemory: res.data[0].MemorySummary.TotalSystemMemoryGiB,
      memorySpeed: res.data[2].MaximumFrequencyMHz + " Mhz",

      processorModel: res.data[1].Model,
      processorCount: res.data[0].ProcessorSummary.Count,
      processorCores: res.data[1].TotalCores,
      processorStatus: res.data[0].ProcessorSummary.Status.HealthRollUp,
      logicalProc:
        res.data[1].TotalCores !== res.data[1].Oem.Hp.CoresEnabled
          ? "Enabled"
          : "Disabled",
      pxeDevice1: null,
      pxeDevice1Enabled: null,
      powerRecovery: null,
    }
  } else return res
}

async function hpe_managers(uri) {
  const urls = [
    uri + "/redfish/v1/Managers/1",
    uri + "/redfish/v1/Managers/1/EthernetInterfaces",
  ]
  let res = await api_request(urls, uri)

  let active_int = res.data[1].Items.map((val) => {
    if (val.SpeedMbps !== null) return val
  }).filter(Boolean)[0] // Limit to first connected interface

  if (res.status === "success") {
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
  } else return res
}

async function hpe_gpu(uri) {
  // We don't have any HPE nodes with GPU's
  return {
    status: "error",
    message: "GPU request not implemented on HPE nodes",
  }
}

async function hpe_storage(uri) {
  return {
    status: "error",
    message: "Storage request not implemented on HPE nodes",
  }
}

async function hpe_sel(uri) {
  const url = uri + "/redfish/v1/Systems/1/LogServices/log1/Entries"

  let res = await api_request(url, uri)

  if (res.status === "success") {
    return {
      status: res.status,
      count: res.data["Members@odata.count"],
      logs: res.data.Items.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }),
    }
  } else return res
}

// General
async function api_request(url, uri) {
  try {
    let auth = await redfish_auth(uri)
    let header = {
      headers: { method: "GET", "X-Auth-Token": auth.token },
      agent,
    }
    let res = new Object()
    if (typeof url === "string") {
      let res_promise = await fetch(url, header)
      res = await res_promise.json()
      if (res.hasOwnProperty("error")) throw res.error
    } else if (typeof url === "object") {
      res = await Promise.all(
        url.map(async (u) => {
          const res = await fetch(u, header)
          return res.json()
        })
      )
    }
    let logout_url = new String()
    // One of these vendors is not like the others... *cough* HPE
    if (auth.location.slice(0, 1) === "/") {
      logout_url = uri + auth.location
    } else {
      logout_url = auth.location
    }
    await redfish_logout(logout_url, auth.token)

    return { status: "success", data: res }
  } catch (error) {
    return {
      status: "error",
      message: "Redfish API Request error",
      error,
    }
  }
}

async function redfish_auth(uri) {
  const payload = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserName: config.bmc.DELL_USER,
      Password: config.bmc.DELL_PASS,
    }),
    agent,
  }
  const url = `${uri}/redfish/v1/SessionService/Sessions`

  let res_promise = await fetch(url, payload)
  // let res = await res_promise.json()

  return {
    status: "success",
    token: res_promise.headers.get("x-auth-token"),
    location: res_promise.headers.get("location"),
  }
}

async function redfish_logout(url, token) {
  let header = {
    method: "DELETE",
    headers: { "X-Auth-Token": token },
    agent,
  }
  return await fetch(url, header)
}

module.exports = {
  fetchOEM,
  dell_systems,
  dell_managers,
  dell_gpu,
  dell_storage,
  dell_sel,
  sm_systems,
  sm_storage,
  sm_managers,
  sm_gpu,
  sm_sel,
  hpe_systems,
  hpe_managers,
  hpe_gpu,
  hpe_storage,
  hpe_sel,
}
