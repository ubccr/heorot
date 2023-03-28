import {
  Redfish_Chassis_PCIe_devices,
  Redfish_Chassis_enclosure_id,
  Redfish_Managers,
  Redfish_Managers_Ethernet_interfaces,
  Redfish_Managers_Ethernet_interfaces_id,
  Redfish_Managers_Log_services_SEL,
  Redfish_Managers_Log_services_SEL_Entries,
  Redfish_Systems,
  Redfish_Systems_Boot_options,
  Redfish_Systems_Memory,
  Redfish_Systems_Memory_id,
  Redfish_Systems_Network_interfaces,
  Redfish_Systems_Network_interfaces_id,
  Redfish_Systems_Network_interfaces_id_Network_ports,
  Redfish_Systems_Network_interfaces_id_Network_ports_id,
  Redfish_Systems_Processors,
  Redfish_Systems_Processors_CPU,
  Redfish_Systems_Storage,
  Redfish_Systems_Storage_id,
  Redfish_Systems_Storage_id_Drives,
  Redfish_Systems_Storage_id_Volumes,
  Redfish_Systems_Storage_id_Volumes_id,
} from "../../types/redfish"
import { apiResponse, api_request } from "../redfish"

import { Auth } from "./auth"

export default async function dell_redfish(auth: Auth) {
  let API_response = await Promise.all([
    System_info(auth),
    BMC_info(auth),
    Network_devices(auth),
    Memory_info(auth),
    Processor_info(auth),
    PCI_devices(auth),
    SEL(auth),
    Storage_info(auth),
  ])

  for (const response of API_response) {
    if (response.success === false) return response
  }

  return {
    success: true,
    ...API_response[0].data,
    bmc: API_response[1].data,
    network: API_response[2].data,
    memory: API_response[3].data,
    processor: API_response[4].data,
    pcie: API_response[5].data?.pcie,
    gpus: API_response[5].data?.gpus,
    sel: API_response[6].data,
    storage: API_response[7].data,
  }
}

interface Boot_Info {
  id: string
  name: string
  type: string
  enabled: boolean
}
interface Func_System_info_Res {
  model: string
  manufacturer: string
  service_tag: string
  bios_version: string
  boot_info: Boot_Info[]
  hostname: string
  power_state: string
}

async function System_info(auth: Auth) {
  let output: apiResponse<Func_System_info_Res> = { success: false }
  try {
    const systems_res: apiResponse<Redfish_Systems> = await api_request("/redfish/v1/Systems/System.Embedded.1", auth)
    if (!systems_res.data) throw systems_res.info

    let boot_info: Boot_Info[] = []
    if (systems_res.data.Boot.BootOptions !== undefined) {
      const boot_option_urls: apiResponse<Redfish_Systems_Boot_options> = await api_request(
        systems_res.data.Boot.BootOptions["@odata.id"],
        auth
      )
      if (!boot_option_urls.data) throw boot_option_urls.info
      const boot_options = await Promise.all(
        boot_option_urls.data.Members.map((url) => api_request(url["@odata.id"], auth))
      )
      boot_options.forEach((option) => {
        if (option.data) {
          boot_info.push({
            id: option.data.Id,
            name: option.data.DisplayName,
            type: option.data.Name,
            enabled: option.data.BootOptionEnabled,
          })
        }
      })
    }

    output = {
      success: true,
      data: {
        model: systems_res.data.Model,
        manufacturer: systems_res.data.Manufacturer,
        service_tag: systems_res.data.SKU,
        bios_version: systems_res.data.BiosVersion,
        boot_info,
        hostname: systems_res.data.HostName,
        power_state: systems_res.data.PowerState,
      },
    }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get System info from the node.", error } }
  } finally {
    return output
  }
}

interface Func_BMC_info_Res {
  status: string
  version: string
  mac: string
  vlan: number
  ip: string
  type: string
  gateway: string
  subnet_mask: string
  dns: Array<string>
}

async function BMC_info(auth: Auth) {
  let output: apiResponse<Func_BMC_info_Res> = { success: false }
  try {
    const managers_res: apiResponse<Redfish_Managers> = await api_request(
      "/redfish/v1/Managers/iDRAC.Embedded.1/",
      auth
    )
    if (!managers_res.data) throw managers_res.info
    const managers_interfaces_res: apiResponse<Redfish_Managers_Ethernet_interfaces> = await api_request(
      managers_res.data.EthernetInterfaces["@odata.id"],
      auth
    )
    if (!managers_interfaces_res.data) throw managers_interfaces_res.info
    const managers_nic_res: apiResponse<Redfish_Managers_Ethernet_interfaces_id> = await api_request(
      managers_interfaces_res.data.Members[0]["@odata.id"],
      auth
    )
    if (!managers_nic_res.data) throw managers_nic_res.info

    output = {
      success: true,
      data: {
        status: managers_res.data.Status.Health,
        version: managers_res.data.FirmwareVersion,
        mac: managers_nic_res.data.MACAddress,
        vlan: managers_nic_res.data.VLAN.VLANId,
        ip: managers_nic_res.data.IPv4Addresses[0].Address,
        type: managers_nic_res.data.IPv4Addresses[0].AddressOrigin,
        gateway: managers_nic_res.data.IPv4Addresses[0].Gateway,
        subnet_mask: managers_nic_res.data.IPv4Addresses[0].SubnetMask,
        dns: managers_nic_res.data.NameServers.filter((val) => !["::", "0.0.0.0"].includes(val)),
      },
    }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get BMC info from the node.", error } }
  } finally {
    return output
  }
}

interface Port {
  status: String
  link: String
  id: String
  type: String
  mac: String
  speed: Number
  port: String
}
interface Func_Network_devices_Res {
  adapter: String
  ports: Port[]
}

async function Network_devices(auth: Auth) {
  let output: apiResponse<any> = { success: false }
  try {
    // Get network adapter list
    const interface_urls: apiResponse<Redfish_Systems_Network_interfaces> = await api_request(
      "/redfish/v1/Systems/System.Embedded.1/NetworkInterfaces/",
      auth
    )
    if (!interface_urls.data) throw interface_urls.info

    const network_interfaces: apiResponse<Redfish_Systems_Network_interfaces_id>[] = await Promise.all(
      interface_urls.data.Members.map((interface_url) => api_request(interface_url["@odata.id"], auth))
    )

    const network_port_urls: apiResponse<Redfish_Systems_Network_interfaces_id_Network_ports>[] = await Promise.all(
      network_interfaces.map((network_interface) => {
        if (network_interface.data) return api_request(network_interface.data.NetworkPorts["@odata.id"], auth)
        else
          return {
            success: false,
            info: { message: "Failed to get network port urls from the node.", error: network_interface },
          }
      })
    )

    let data: Func_Network_devices_Res[] = []
    for (const network_port of network_port_urls) {
      if (!network_port.data) continue
      const interface_ports_res: apiResponse<Redfish_Systems_Network_interfaces_id_Network_ports_id>[] =
        await Promise.all(network_port.data.Members.map((port_url) => api_request(port_url["@odata.id"], auth)))

      let adapter: Func_Network_devices_Res = {
        adapter: network_port.data["@odata.id"].split("/")[6], // not an ideal way to get the adapter name
        ports: [],
      }
      for (const network_port of interface_ports_res) {
        if (!network_port.data) continue
        adapter.ports.push({
          status: network_port.data.Status.Health ?? "Unknown",
          link: network_port.data.LinkStatus,
          id: network_port.data.Id,
          type: network_port.data.ActiveLinkTechnology,
          mac: network_port.data.AssociatedNetworkAddresses[0], // ? when would this array have multiple entries?
          speed: network_port.data.SupportedLinkCapabilities[0].LinkSpeedMbps,
          port: network_port.data.PhysicalPortNumber,
        })
      }
      data.push(adapter)
    }

    output = { success: true, data }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get Network info from the node.", error } }
  } finally {
    return output
  }
}

interface PCI_Device {
  status: string
  manufacturer: string
  model: string
}
interface Func_PCI_devices_Res {
  gpus: PCI_Device[]
  pcie: PCI_Device[]
}

async function PCI_devices(auth: Auth) {
  let output: apiResponse<Func_PCI_devices_Res> = { success: false }
  try {
    let systems: apiResponse<Redfish_Systems> = await api_request("/redfish/v1/Systems/System.Embedded.1", auth)
    if (!systems.data) throw systems
    if (systems.data.PCIeDevices === undefined) throw "PCIe devices object not found at expected endpoint!"

    let PCI_urls = systems.data.PCIeDevices.map((val) => val["@odata.id"])

    let PCI_devices: Array<apiResponse<Redfish_Chassis_PCIe_devices>> = await Promise.all(
      PCI_urls.map((url) => api_request(url, auth))
    )

    let gpus_res = PCI_devices.filter(
      (val) =>
        val.data?.Manufacturer === "NVIDIA Corporation" ||
        val.data?.Manufacturer === "Advanced Micro Devices, Inc. [AMD/ATI]"
    )
    let ib_cards_res = PCI_devices.filter(
      (val) => val.data?.Manufacturer === "Mellanox Technologies" || val.data?.Name?.match(/Omni-Path/g)
    )

    let gpus: PCI_Device[] = []
    gpus_res.forEach((val) => {
      if (val.data)
        gpus.push({
          status: val.data.Status.Health,
          manufacturer: val.data.Manufacturer,
          model: val.data.Name,
        })
    })
    let pcie: PCI_Device[] = []
    ib_cards_res.forEach((val) => {
      if (val.data)
        pcie.push({
          status: val.data.Status.Health,
          manufacturer: val.data.Manufacturer,
          model: val.data.Name,
        })
    })

    output = { success: true, data: { gpus, pcie } }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get PCIeDevices data from the node.", error } }
  } finally {
    return output
  }
}

interface Dimms {
  name: string
  status: string
  speed_Mhz: number
  module_type: string
  capacity_MiB: number
  error_correction: string
  manufacturer: string
  memory_type: string
  memory_modes: Array<string>
  volatile_size_MiB: number
  non_volatile_size_MiB: number
  write_endurance_percent: number | null
}

interface Func_Memory_info_Res {
  status: string
  dimms: Array<Dimms>
}

async function Memory_info(auth: Auth) {
  let output: apiResponse<Func_Memory_info_Res> = { success: false }
  try {
    const systems_memory_res: apiResponse<Redfish_Systems_Memory> = await api_request(
      "/redfish/v1/Systems/System.Embedded.1/Memory",
      auth
    )
    if (!systems_memory_res.data) throw systems_memory_res.info

    let systems_memory_dimms_res: apiResponse<Redfish_Systems_Memory_id>[] = await Promise.all(
      systems_memory_res.data.Members.map((val) => api_request(val["@odata.id"], auth))
    )

    let dimms: Dimms[] = []
    systems_memory_dimms_res.forEach((val) => {
      if (val.data)
        dimms.push({
          name: val.data.Name,
          status: val.data.Status.Health,
          speed_Mhz: val.data.OperatingSpeedMhz,
          module_type: val.data.BaseModuleType ?? "",
          capacity_MiB: val.data.CapacityMiB,
          error_correction: val.data.ErrorCorrection,
          manufacturer: val.data.Manufacturer,
          memory_type: val.data.MemoryType ?? "",
          memory_modes: val.data.OperatingMemoryModes,
          volatile_size_MiB: val.data.VolatileSizeMiB ?? 0,
          non_volatile_size_MiB: val.data.NonVolatileSizeMiB ?? 0,
          write_endurance_percent: val.data.Oem?.Dell.DellMemory.RemainingRatedWriteEndurancePercent ?? null,
        })
    })

    // TODO: support returning Critical and Warning depending on status
    let status = dimms.some((val) => ["Critical", "Warning"].includes(val.status)) ? "Critical" : "OK"
    let total_size_MiB = 0
    let total_NV_size_MiB = 0
    let total_V_size_MiB = 0
    dimms.forEach((val) => {
      total_size_MiB += val.capacity_MiB
      total_NV_size_MiB += val.non_volatile_size_MiB
      total_V_size_MiB += val.volatile_size_MiB
    })
    let data = {
      status,
      total_size_MiB,
      total_NV_size_MiB,
      total_V_size_MiB,
      speed_MhZ: dimms[0].speed_Mhz,
      dimms,
    }
    output = { success: true, data }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get Memory info from the node.", error } }
  } finally {
    return output
  }
}

interface Processor {
  status: string
  architecture: string
  manufacturer: string
  max_frequency: number
  model: string
  operating_speed_MHz?: number
  socket: string
  total_cores: number
  total_threads: number
  turbo?: string
}

interface Func_Processor_info_Res {
  status: string
  model: string
  count: number
  physical_cores: number
  logical_cores: number
  processors: Processor[]
}

async function Processor_info(auth: Auth) {
  let output: apiResponse<Func_Processor_info_Res> = { success: false }
  try {
    const systems_res: apiResponse<Redfish_Systems> = await api_request("/redfish/v1/Systems/System.Embedded.1", auth)
    if (!systems_res.data) throw systems_res.info

    const processors_list_res: apiResponse<Redfish_Systems_Processors> = await api_request(
      "/redfish/v1/Systems/System.Embedded.1/Processors",
      auth
    )
    if (!processors_list_res.data) throw processors_list_res.info

    const processors_res: apiResponse<Redfish_Systems_Processors_CPU>[] = await Promise.all(
      processors_list_res.data.Members.map((val) => api_request(val["@odata.id"], auth))
    )

    let processors: Processor[] = []
    processors_res.forEach((val) => {
      if (val.data && val.data.ProcessorType === "CPU")
        processors.push({
          status: val.data.Status.Health,
          architecture: val.data.ProcessorArchitecture,
          manufacturer: val.data.Manufacturer,
          max_frequency: val.data.MaxSpeedMHz,
          model: val.data.Model,
          operating_speed_MHz: val.data.OperatingSpeedMHz,
          socket: val.data.Socket,
          total_cores: val.data.TotalCores,
          total_threads: val.data.TotalThreads,
          turbo: val.data.TurboState,
        })
    })

    let data = {
      status: systems_res.data.ProcessorSummary.Status.Health, // will be deprecated
      model: systems_res.data.ProcessorSummary.Model,
      count: systems_res.data.ProcessorSummary.Count,
      physical_cores: systems_res.data.ProcessorSummary.CoreCount ?? 0,
      logical_cores: systems_res.data.ProcessorSummary.LogicalProcessorCount ?? 0,
      processors,
    }
    output = { success: true, data }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get Processor info from the node.", error } }
  } finally {
    return output
  }
}

interface SEL_log {
  created: string
  message: string
  severity: string
}
export interface Func_SEL_res {
  count: number
  logs: Array<SEL_log>
}

async function SEL(auth: Auth) {
  let output: apiResponse<Func_SEL_res> = { success: false }
  try {
    // Get correct uri for entries (older idracs are /logs/sel, newer are /LogServices/Sel/Entries)
    const sel_res: apiResponse<Redfish_Managers_Log_services_SEL> = await api_request(
      "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel",
      auth
    )
    if (!sel_res.data) throw sel_res.info
    // Get entries
    const entries_res: apiResponse<Redfish_Managers_Log_services_SEL_Entries> = await api_request(
      sel_res.data.Entries["@odata.id"],
      auth
    )
    if (!entries_res.data) throw entries_res.info

    let log_arr = entries_res.data.Members.map((val) => {
      return {
        created: val.Created,
        message: val.Message,
        severity: val.Severity,
      }
    })
    output = { success: true, data: { count: entries_res.data["Members@odata.count"], logs: log_arr } }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get SEL entries from the node.", error } }
  } finally {
    return output
  }
}

interface Drives {
  status: string
  slot: number | null
  capacity: number
  type: string
  name: string
  model: string
  form_factor: string | null
  manufacturer: string
  description: string
  serial_number: string
  protocol: string
  capable_speed: number
  rotation_speed: number | null
  predicted_write_endurance: number
  failure_predicted: boolean
  hotspare_type: string
}
interface Volumes {
  name: string
  description: string
  status: string
  volume_type: string
  capacity: number
  raid_type: string | null
}
interface Func_Storage_info_Res {
  name: string
  model: string
  status: string
  speed: number
  firmware: string
  slot_count: number
  drives: Drives[]
  volumes: Volumes[]
}

async function Storage_info(auth: Auth) {
  let output: apiResponse<any> = { success: false }
  try {
    const storage_urls_res: apiResponse<Redfish_Systems_Storage> = await api_request(
      "/redfish/v1/Systems/System.Embedded.1/Storage",
      auth
    )
    if (!storage_urls_res.data) throw storage_urls_res.info
    const controller_res: apiResponse<Redfish_Systems_Storage_id>[] = await Promise.all(
      storage_urls_res.data.Members.map((val) => api_request(val["@odata.id"], auth))
    )
    let data_res: Func_Storage_info_Res[] = []

    for (const controller of controller_res) {
      if (!controller.data || controller.data["Drives@odata.count"] < 1) continue
      // get enclosure info (slot_count)
      let enclosure_url = controller.data.Links.Enclosures[0]["@odata.id"]
      let slot_count = 0
      if (enclosure_url.match(/Enclosure.Internal/)) {
        let enclosure_res: apiResponse<Redfish_Chassis_enclosure_id> = await api_request(enclosure_url, auth)
        if (enclosure_res.data?.Oem?.Dell.DellChassisEnclosure !== undefined)
          slot_count = enclosure_res.data?.Oem?.Dell.DellChassisEnclosure?.SlotCount ?? 0
        else if (enclosure_res.data?.Oem?.Dell.DellEnclosure !== undefined)
          slot_count = enclosure_res.data?.Oem?.Dell.DellEnclosure?.SlotCount ?? 0
      }
      // get drives and volumes
      let drives_res: apiResponse<Redfish_Systems_Storage_id_Drives>[] = await Promise.all(
        controller.data.Drives.map((drives_res) => api_request(drives_res["@odata.id"], auth))
      )
      if (!drives_res) continue
      let volume_urls: apiResponse<Redfish_Systems_Storage_id_Volumes> = await api_request(
        controller.data.Volumes["@odata.id"],
        auth
      )
      if (!volume_urls.data) continue
      let volumes_res: apiResponse<Redfish_Systems_Storage_id_Volumes_id>[] = await Promise.all(
        volume_urls.data.Members.map((val) => api_request(val["@odata.id"], auth))
      )

      let drives: Drives[] = []
      drives_res.forEach((val) => {
        if (val.data)
          drives.push({
            status: val.data.Status.Health,
            slot: val.data.Oem?.Dell.DellPhysicalDisk.Slot ?? null,
            capacity: val.data.CapacityBytes,
            type: val.data.MediaType,
            name: val.data.Name,
            model: val.data.Model,
            form_factor: val.data.Oem?.Dell.DellPhysicalDisk.DriveFormFactor ?? null,
            manufacturer: val.data.Manufacturer,
            description: val.data.Description,
            serial_number: val.data.SerialNumber,
            protocol: val.data.Protocol,
            capable_speed: val.data.CapableSpeedGbs,
            rotation_speed: val.data.RotationSpeedRPM,
            predicted_write_endurance: val.data.PredictedMediaLifeLeftPercent,
            failure_predicted: val.data.FailurePredicted,
            hotspare_type: val.data.HotspareType,
          })
      })
      let volumes: Volumes[] = []
      volumes_res.forEach((val) => {
        if (val.data)
          volumes.push({
            name: val.data.Name,
            description: val.data.Description,
            status: val.data.Status.Health,
            volume_type: val.data.VolumeType,
            capacity: val.data.CapacityBytes,
            raid_type: val.data.RAIDType ?? null,
          })
      })
      data_res.push({
        name: controller.data.Name,
        model: controller.data.StorageControllers[0].Model,
        status: controller.data.Status.Health,
        speed: controller.data.StorageControllers[0].SpeedGbps,
        firmware: controller.data.StorageControllers[0].FirmwareVersion,
        slot_count,
        drives,
        volumes,
      })
    }

    if (!data_res) throw data_res

    const data = await Promise.all(data_res)

    output = { success: true, data: data }
  } catch (error) {
    output = { success: false, info: { message: "Failed to get Storage info from the node.", error } }
  } finally {
    return output
  }
}
