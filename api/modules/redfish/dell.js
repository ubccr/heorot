const { api_request } = require("./api_request")

const dell_query = async (auth) => {
  let urls = [
    "/redfish/v1/Systems/System.Embedded.1",
    "/redfish/v1/Systems/System.Embedded.1/Bios",
    "/redfish/v1/Managers/iDRAC.Embedded.1",
    "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces",
    "/redfish/v1/Systems/System.Embedded.1/Processors",
    "/redfish/v1/Systems/System.Embedded.1/Storage",
  ]

  let query_res = await api_request(urls, auth)
  let systems = query_res.data[0]
  let s_bios = query_res.data[1]
  let managers = query_res.data[2]

  //   let urls2 = []

  //   let query_res_2 = await api_request( urls2, auth)

  // boot order
  let bootArr = systems.Boot.BootOrder === undefined ? null : systems.Boot.BootOrder.join(",")
  let boot_order = s_bios.Attributes.SetBootOrderEn !== undefined ? s_bios.Attributes.SetBootOrderEn : bootArr

  let response = {
    model: systems.Model,
    manufacturer: systems.Manufacturer,
    service_tag: systems.SKU,
    bios_version: systems.BiosVersion,
    boot_order: boot_order,
    hostname: systems.HostName,
    bmc: {
      status: managers.Status.Health,
      version: managers.FirmwareVersion,
      power_state: managers.PowerState,
      hostname: managers.HostName,
      vlan: "",
      addresses: [
        {
          ip: "",
          origin: "",
          gateway: "",
          subnet_mask: "",
        },
      ],
      nic: "",
      mac: "",
      dns: [],
    },
    memory: {
      status: systems.MemorySummary.Status.Health,
      size: systems.MemorySummary.TotalSystemMemoryGiB,
      speed: s_bios.Attributes.SysMemSpeed,
    },
    processor: [
      {
        status: "",
        model: "",
        cores: "",
        logical_proc: "",
      },
    ],
    gpu: {
      vGPU: false,
      physical: 0,
      virtual: 0,
      gpus: [
        {
          status: "",
          manufacturer: "",
          model: "",
        },
      ],
    },
    storage: {
      controller: "",
      firmware: "",
      status: "",
      drive_count: "",
      slot_count: "",
      speed: 0,
      volumes: [
        {
          name: "",
          drive_status: "",
          raid: "",
          capacity: "",
        },
      ],
      drives: [
        {
          status: "",
          capacity: "",
          type: "",
          name: "",
          model: "",
          manufacturer: "",
          description: "",
          serial_number: "",
          protocol: "",
          capable_speed: 0,
          rotation_speed: 0,
          failure_predicted: false,
          hotspare_type: "",
          block_size: 0,
          id: "",
        },
      ],
    },
    sel: {
      count: 0,
      logs: [
        {
          created: "",
          message: "",
          severity: "",
        },
      ],
    },
  }

  return query_res
}

module.exports = {
  dell_query,
}
