const { api_request } = require("./redfish")

async function dell_systems(uri, token) {
  const url = uri + "/redfish/v1/Systems/System.Embedded.1"
  const bios_url = url + "/Bios"
  try {
    let res = await api_request(url, token)
    let res2 = await api_request(bios_url, token)

    if (res.status === "error") throw res.error
    if (res2.status === "error") throw res2.error

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
  } catch (error) {
    return {
      status: "error",
      message: "Error calling redfish api",
      error,
    }
  }
}

async function sm_systems(uri, token) {
  const urls = [
    uri + "/redfish/v1/Systems/1",
    uri + "/redfish/v1/Systems/1/Processors/1",
    uri + "/redfish/v1/Systems/1/Memory/1",
  ]
  let res = await api_request(urls, token)

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

async function hpe_systems(uri, token) {
  const urls = [
    uri + "/redfish/v1/Systems/1",
    uri + "/redfish/v1/Systems/1/Processors/1",
    uri + "/redfish/v1/Systems/1/Memory/proc1dimm1",
  ]
  let res = await api_request(urls, token)

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

module.exports = {
  dell_systems,
  sm_systems,
  hpe_systems,
}
