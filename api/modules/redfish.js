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

    if (Object.keys(resOEM).length === 0) OEM = "SuperMicro"
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
    model: res.data.Model,
    serviceTag: res.data.SKU,
    biosVersion: res.data.BiosVersion,
    bootOrder: bootOrder,
    hostName: res.data.HostName,
    memoryStatus: res.data.MemorySummary.Status.Health,
    totalMemory: res.data.MemorySummary.TotalSytemMemoryGiB,
    processorModel: res.data.ProcessorSummary.Model,
    processorCount: res.data.ProcessorSummary.Count,
    processorCores: res.data.ProcessorSummary.LogicalProcessorCount,
    processorStatus: res.data.ProcessorSummary.Status.Health,

    memorySpeed: res2.data.Attributes.SysMemSpeed,
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
          GPUStatus: val.Status.Health,
          manufacturer: val.Manufacturer,
          model: val.Model,
          processorType: val.ProcessorType,
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
              gpuStatus: val.Status.Health,
              manufacturer: val.Manufacturer,
              model: val.Name,
              processorType: "GPU",
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

async function dell_storage(uri) {
  let tmp_url = uri + "/redfish/v1/Systems/System.Embedded.1/Storage"
  let tmp_res = await api_request(tmp_url, uri)
  if (tmp_res.status === "success") {
    const url = uri + tmp_res.data.Members[0]["@odata.id"]
    let res = await api_request(url, uri)
    let storageController = res.data.StorageControllers[0] ?? null

    // Volumes
    tmp_url = uri + res.data.Volumes["@odata.id"]
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
    let tmp2_urls = res.data.Drives.map((val) => uri + val["@odata.id"])
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
      driveCount: res.data["Drives@odata.count"],
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

async function redfishRequest(urls, oem) {
  if (oem === "Dell") {
  } else if (oem === "SuperMicro") {
    return await Promise.all(
      urls.endpoints.map(async (url) => {
        return await api_request(urls.uri + url, urls.uri)
      })
    )
  } else if (oem === "HPE") {
    return await Promise.all(
      urls.endpoints.map(async (url) => {
        return await api_request(urls.uri + url, urls.uri)
      })
    )
  } else {
  }
}

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
}
