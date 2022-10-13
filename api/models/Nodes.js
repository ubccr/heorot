const mongoose = require("mongoose")
const Schema = mongoose.Schema
const nodesSchema = new Schema(
  {
    node: { type: String, required: true, unique: true },
    grendel: {
      id: { type: String },
      firmware: { type: String },
      name: { type: String },
      interfaces: [
        {
          mac: { type: String },
          ip: { type: String },
          ifname: { type: String },
          fqdn: { type: String },
          bmc: { type: Boolean },
        },
      ],
      provision: { type: Boolean },
      boot_image: { type: String },
      tags: { type: Array },
    },
    redfish: {
      model: { type: String },
      manufacturer: { type: String },
      service_tag: { type: String },
      bios_version: { type: String },
      boot_order: { type: String },
      hostname: { type: String },
      bmc: {
        status: { type: String },
        version: { type: String },
        power_state: { type: String },
        hostname: { type: String },
        vlan: { type: String },
        addresses: [
          {
            ip: { type: String },
            origin: { type: String },
            gateway: { type: String },
            subnet_mask: { type: String },
          },
        ],
        nic: { type: String },
        mac: { type: String },
        dns: { type: Array },
      },
      memory: {
        memory_status: { type: String },
        memory_size: { type: String },
        memory_speed: { type: String },
      },
      processor: [
        {
          status: { type: String },
          model: { type: String },
          count: { type: String },
          cores: { type: String },
          logical_proc: { type: String },
        },
      ],
      gpu: {
        vGPU: { type: Boolean },
        physical: { type: Number },
        virtual: { type: Number },
        gpus: [
          {
            status: { type: String },
            manufacturer: { type: String },
            model: { type: String },
          },
        ],
      },
      storage: {
        controller: { type: String },
        firmware: { type: String },
        status: { type: String },
        drive_count: { type: String },
        slot_count: { type: String },
        speed: { type: Number },
        drives: [
          {
            status: { type: String },
            capacity: { type: String },
            type: { type: String },
            name: { type: String },
            model: { type: String },
            manufacturer: { type: String },
            description: { type: String },
            serial_number: { type: String },
            protocol: { type: String },
            capabe_speed: { type: Number },
            rotation_speed: { type: Number },
            failure_predicted: { type: Boolean },
            hotspare_type: { type: String },
            block_size: { type: Number },
            id: { type: String },
          },
        ],
      },
      sel: {
        count: { type: Number },
        logs: [
          {
            created: { type: String },
            message: { type: String },
            severity: { type: String },
          },
        ],
      },
    },
  },
  { timestamps: true }
)

const Nodes = mongoose.model("Nodes", nodesSchema)
module.exports = Nodes
