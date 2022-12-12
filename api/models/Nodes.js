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
          vlan: { type: String },
          mtu: { type: Number },
        },
      ],
      provision: { type: Boolean },
      boot_image: { type: String },
      tags: { type: Array },
    },
    redfish: {
      status: { type: String },
      message: { type: String },
      error: { type: Object },

      model: { type: String },
      manufacturer: { type: String },
      service_tag: { type: String },
      bios_version: { type: String },
      boot_order: { type: String },
      hostname: { type: String },
      power_state: { type: String },
      mac: { type: String },
      bmc: {
        status: { type: String },
        version: { type: String },
        hostname: { type: String },
        vlan: { type: String },
        addresses: {
          ip: { type: String },
          type: { type: String },
          gateway: { type: String },
          subnet_mask: { type: String },
        },
        dns: { type: Array },
      },
      network: [
        {
          status: { type: String },
          link: { type: String },
          id: { type: String },
          type: { type: String },
          mac: { type: String },
          speed: { type: Number },
          port: { type: String },
        },
      ],
      pcie: [
        {
          status: { type: String },
          manufacturer: { type: String },
          name: { type: String },
        },
      ],
      memory: {
        status: { type: String },
        size: { type: String },
        speed: { type: String },
      },
      processor: [
        {
          status: { type: String },
          model: { type: String },
          cores: { type: Number },
          turbo: { type: String },
          threads: { type: Number },
          max_frequency: { type: Number },
          frequency: { type: Number },
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
        status: { type: String },
        drive_count: { type: String },
        slot_count: { type: String },
        volumes: [
          {
            name: { type: String },
            description: { type: String },
            status: { type: String },
            volume_type: { type: String },
            raid_type: { type: String },
            capacity: { type: String },
          },
        ],
        drives: [
          {
            status: { type: String },
            slot: { type: String },
            capacity: { type: String },
            type: { type: String },
            name: { type: String },
            model: { type: String },
            manufacturer: { type: String },
            description: { type: String },
            serial_number: { type: String },
            protocol: { type: String },
            capable_speed: { type: Number },
            rotation_speed: { type: Number },
            predicted_write_endurance: { type: Number },
            failure_predicted: { type: Boolean },
            hotspare_type: { type: String },
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
    notes: { type: String },
  },
  { timestamps: true }
)

const Nodes = mongoose.model("Nodes", nodesSchema)
module.exports = Nodes
