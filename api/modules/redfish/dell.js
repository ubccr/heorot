const { formatBytes } = require("../math")
const { api_request } = require("./api_request")

const dell_query = async (auth) => {
  let urls = [
    "/redfish/v1/Systems/System.Embedded.1",
    "/redfish/v1/Systems/System.Embedded.1/Bios",
    "/redfish/v1/Managers/iDRAC.Embedded.1",
    "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces",
    "/redfish/v1/Systems/System.Embedded.1/Processors",
    "/redfish/v1/Systems/System.Embedded.1/Storage",
    "/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel",
    "/redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/",
  ]

  let query_res = await api_request(urls, auth)
  if (query_res?.status === "error") return query_res

  let systems = query_res.data[0]
  let s_bios = query_res.data[1]?.Attributes
  let managers = query_res.data[2]
  let sel = query_res.data[6]
  let cpu_urls = query_res.data[4]?.Members.map((val) => val["@odata.id"]).filter((val) => val.match(/CPU/))
  let gpu_urls = query_res.data[4]?.Members.map((val) => val["@odata.id"]).filter((val) => val.match(/Video/))
  let storage_urls = query_res.data[5]?.Members?.map((val) => val["@odata.id"])
  let s_volume_urls = query_res.data[5]?.Members?.map((val) => val["@odata.id"] + "/Volumes")
  let pci_urls = systems?.PCIeDevices?.map((val) => val["@odata.id"]) ?? []
  let network_urls = query_res.data[7]?.Members?.map((val) => val["@odata.id"] + "/NetworkPorts")

  // second query
  let query_res_2 = await Promise.all([
    await api_request(query_res.data[3]?.Members?.[0]["@odata.id"], auth),
    await api_request(cpu_urls, auth),
    await api_request(gpu_urls, auth),
    await api_request(storage_urls, auth),
    await api_request(s_volume_urls, auth),
    await api_request(pci_urls, auth),
    await api_request(network_urls, auth),
  ])

  let pci_devices = query_res_2[5].data ?? []
  let bmc = query_res_2[0]?.data
  let cpu = query_res_2[1]?.data
  let hdd = query_res_2[3]?.data.length !== undefined ? query_res_2[3]?.data : []
  let gpu =
    query_res_2[2]?.data.length > 0
      ? query_res_2[2]?.data
      : pci_devices.filter((val) => ["NVIDIA Corporation"]?.includes(val?.Manufacturer)) // add AMD?
  let storage = hdd.find((val) => val.Drives?.length > 0) ?? []
  let ib = pci_devices.filter(
    (val) => ["Mellanox Technologies"].includes(val.Manufacturer) || val.Description?.match(/Omni/g)
  ) // find Mellanox IB & Omni path cards

  let network_port_urls = []
  if (query_res_2[6].data.length > 0)
    query_res_2[6].data.forEach((val) => val.Members.forEach((val2) => network_port_urls.push(val2["@odata.id"])))

  // third query
  let storage_link = storage.Links?.Enclosures.find((val) => val["@odata.id"].match(/Enclosure/g))
  let enclosure_url = storage_link !== undefined ? storage_link["@odata.id"] : null
  let drive_urls = storage.Drives?.map((val) => val["@odata.id"])
  let volume_urls = []
  let vol = query_res_2[4].data.length !== undefined ? query_res_2[4].data : []
  vol.forEach((val) => {
    if (val["Members@odata.count"] > 0) val.Members.forEach((vol) => volume_urls.push(vol["@odata.id"]))
  })

  let query_res_3 = await Promise.all([
    await api_request(enclosure_url, auth),
    await api_request(drive_urls, auth),
    await api_request(storage?.Volumes?.["@odata.id"] ?? "", auth),
    await api_request(volume_urls, auth),
    await api_request(network_port_urls, auth),
  ])

  // network ports
  let ports = query_res_3[4].data

  // storage
  let drives = query_res_3[1].data
  let volumes = query_res_3[3].data
  let slotCount = 0

  // fix for certain dell models with different object naming
  let tmp_oem = query_res_3[0].data?.Oem?.Dell
  if (tmp_oem !== undefined && tmp_oem.DellChassisEnclosure !== undefined)
    slotCount = tmp_oem.DellChassisEnclosure.SlotCount
  else if (tmp_oem !== undefined && tmp_oem.DellEnclosure !== undefined) slotCount = tmp_oem.DellEnclosure.SlotCount

  // boot order
  let bootArr = systems.Boot.BootOrder === undefined ? null : systems.Boot.BootOrder.join(",")
  let boot_order = s_bios.SetBootOrderEn !== undefined ? s_bios.SetBootOrderEn : bootArr

  // GPU
  let physical_gpu = 0
  let virtual_gpu = 0
  gpu.forEach((val) => {
    if (val.Id.slice(-2) === "-1" || val.Id.slice(-2) === "-0") physical_gpu++ // -0 is for older versions (~13th gen)
    else virtual_gpu++
  })
  let response = {
    model: systems.Model,
    manufacturer: systems.Manufacturer,
    service_tag: systems.SKU,
    bios_version: systems.BiosVersion,
    boot_order: boot_order,
    hostname: systems.HostName,
    power_state: systems.PowerState,
    bmc: {
      status: managers.Status.Health,
      version: managers.FirmwareVersion,
      vlan: bmc.VLAN.VLANId,
      mac: bmc.MACAddress,
      addresses: {
        // assuming one IP address per bmc
        ip: bmc.IPv4Addresses[0].Address,
        type: bmc.IPv4Addresses[0].AddressOrigin,
        gateway: bmc.IPv4Addresses[0].Gateway,
        subnet_mask: bmc.IPv4Addresses[0].SubnetMask,
      },
      dns: bmc.NameServers.filter((val) => !["::", "0.0.0.0"].includes(val)), // filter out garbage DNS data
    },
    memory: {
      status: systems.MemorySummary.Status.Health,
      type: s_bios.SysMemType,
      size: s_bios.SysMemSize,
      speed: s_bios.SysMemSpeed,
    },
    network: ports?.map((val) => {
      return {
        status: val.Status?.Health,
        link: val.LinkStatus,
        id: val.Id,
        type: val.ActiveLinkTechnology,
        mac: val.AssociatedNetworkAddresses[0],
        speed: val.CurrentLinkSpeedMbps,
        port: val.PhysicalPortNumber,
      }
    }),
    pcie: ib.map((val) => {
      return {
        status: val.Status?.Health,
        manufacturer: val.Manufacturer,
        name: val.Name,
      }
    }),
    processor: cpu?.map((val) => {
      return {
        status: val.Status?.Health,
        model: val.Model,
        cores: val.TotalCores,
        turbo: val.TurboState ?? s_bios.ProcTurboMode,
        threads: val.TotalThreads,
        max_frequency: val.MaxSpeedMHz,
        frequency: val.OperatingSpeedMHz ?? parseFloat(val.Model.match(/[0-9]\.[0-9]{2}/g)[0]) * 1000, // fix for some nodes not having OperatingSpeedMHz object | converts speed at end of proccessor model name
        logical_proc: val.TotalCores !== val.TotalThreads ? "Enabled" : "Disabled",
      }
    }),
    gpu: {
      vGPU: virtual_gpu === 0 ? false : true,
      physical: physical_gpu,
      virtual: virtual_gpu,
      gpus: gpu
        .map((val) => {
          if (val.Id.slice(-2) === "-1" || val.Id.slice(-2) === "-0")
            return {
              status: val.Status?.Health,
              manufacturer: val.Manufacturer,
              model: val.Model ?? val.Name,
            }
        })
        .filter(Boolean),
    },
    storage: {
      controller: storage.Name,
      status: storage.Status.Health,
      drive_count: storage["Drives@odata.count"],
      slot_count: slotCount,
      volumes: volumes
        ?.map((val) => {
          if (!val.Name.match(/NonRAID/g))
            return {
              name: val.Name,
              description: val.Description,
              status: val.Status?.Health,
              volume_type: val.VolumeType,
              raid_type: val.RAIDType ?? "",
              capacity: formatBytes(val.CapacityBytes, 1),
            }
        })
        .filter(Boolean),
      drives: drives.map((val) => {
        return {
          status: val.Status?.Health,
          slot: val.PhysicalLocation?.PartLocation.LocationOrdinalValue, // doesn't work on older nodes
          capacity: formatBytes(val.CapacityBytes, 1),
          type: val.MediaType,
          name: val.Name,
          model: val.Model,
          form_factor: val.Oem?.Dell?.DellPhysicalDisk?.DriveFormFactor ?? "",
          manufacturer: val.Manufacturer,
          description: val.Description,
          serial_number: val.SerialNumber,
          protocol: val.Protocol,
          capable_speed: val.CapableSpeedGbs,
          rotation_speed: val.RotationSpeedRPM,
          predicted_write_endurance: val.PredictedMediaLifeLeftPercent,
          failure_predicted: val.Failurepredicted, // doesn't work on older nodes
          hotspare_type: val.HotspareType,
        }
      }),
    },
    sel: {
      count: sel["Members@odata.count"],
      logs: sel.Members?.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }),
    },
  }

  return response
}

const dell_badRequestFix = async (uri, auth, fqdn) => {
  let idrac_name = fqdn.split(".")[0]
  let domain_name = fqdn.split(".").splice(1).join(".")

  const endpoint = "/redfish/v1/Managers/iDRAC.Embedded.1/Attributes"
  const body = JSON.stringify({
    Attributes: {
      "NIC.1.DNSDomainFromDHCP": "Disabled",
      "NIC.1.DNSDomainNameFromDHCP": "Disabled",
      "NIC.1.DNSDomainName": domain_name,
      "NIC.1.DNSRacName": idrac_name,
    },
  })
  let res = await api_request(endpoint, auth, "PATCH", false, body)
  console.log(res)
  if (res.status === "success") {
    let res_json = await res.data.json()
    res_json.status = res.status
    if (res.data.status === 200) res_json.message = "Successfully modified iDRAC values"
    else res_json.message = "Error sending redfish request"
    return res_json
  } else return res
}

module.exports = {
  dell_query,
  dell_badRequestFix,
}
