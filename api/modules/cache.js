const Cache = require("../models/Cache")

const setCache = async (node, data) => {
  return await Cache.findOneAndUpdate({ node: node }, { cache: data }, { new: true, upsert: true })
}
const getCache = async (node) => {
  return await Cache.findOne({ node: node })
}

const timeComp = (oldTime, offset = 1 * 24 * 60 * 60 * 1000) => {
  const past = new Date(oldTime)
  const now = new Date()

  const timeDiff = now.getTime() - past.getTime()

  if (timeDiff >= offset) return true
  else return false
}

const redfishMapping = (input, direction) => {
  if (direction === "toDB") {
    let processors = []
    for (let x = 1; x <= input[0].processorCount; x++) {
      processors.push({
        status: input[0].processorStatus,
        model: input[0].processorModel,
        cores: input[0].processorCores,
        logical_proc: input[0].logicalProc,
      })
    }
    return {
      model: input[0].model,
      manufacturer: input[0].manufacturer,
      service_tag: input[0].serviceTag,
      bios_version: input[0].biosVersion,
      boot_order: input[0].bootOrder,
      hostname: input[0].hostName,
      bmc: {
        status: input[1].BMCStatus,
        version: input[1].BMCVersion,
        power_state: input[1].powerState,
        hostname: input[1].hostName,
        vlan: input[1].VLAN.VLANId,
        addresses: input[1].addresses.map((val) => {
          return {
            ip: val.Address,
            origin: val.AddressOrigin,
            gateway: val.Gateway,
            subnet_mask: val.SubnetMask,
          }
        }),
        nic: input[1].NIC,
        mac: input[1].MAC,
        dns: input[1].DNS,
      },
      memory: {
        memory_status: input[0].memoryStatus,
        memory_size: input[0].totalMemory,
        memory_speed: input[0].memorySpeed,
      },
      processor: processors,
      gpu: {
        vGPU: input[2].vGPU,
        physical: input[2].physical,
        virtual: input[2].virtual,
        gpus: input[2].GPUs.map((val) => {
          return {
            status: val.GPUStatus,
            manufacturer: val.manufacturer,
            model: val.model,
          }
        }),
      },
      storage: {
        controller: input[3].controller,
        firmware: input[3].firmware,
        status: input[3].cardStatus,
        drive_count: input[3].driveCount,
        slot_count: input[3].slotCount,
        speed: input[3].speed,
        volumes: input[3].volumes.map((val) => {
          return {
            name: val.name,
            drive_status: val.driveStatus,
            raid: val.RAIDType,
            capacity: val.capacity,
          }
        }),
        drives: input[3].drives.map((val) => {
          return {
            status: val.driveStatus,
            capacity: val.capacity,
            type: val.mediaType,
            name: val.name,
            model: val.model,
            manufacturer: val.manufacturer,
            description: val.description,
            serial_number: val.serialNumber,
            protocol: val.protocol,
            capable_speed: val.capableSpeed,
            rotation_speed: val.rotationSpeed,
            failure_predicted: val.failurePredicted,
            hotspare_type: val.hotspare_type,
            block_size: val.blockSize,
            id: val.id,
          }
        }),
      },
      sel: {
        count: input[4].count,
        logs: input[4].logs.map((val) => {
          return {
            created: val.created,
            message: val.message,
            severity: val.severity,
          }
        }),
      },
    }
  }
}

module.exports = { setCache, getCache, timeComp, redfishMapping }
