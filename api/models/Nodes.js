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
      success: { type: Boolean },
      message: { type: String },
      error: { type: Object },

      model: { type: String },
      manufacturer: { type: String },
      service_tag: { type: String },
      bios_version: { type: String },
      boot_info: [
        {
          id: { type: String },
          name: { type: String },
          type: { type: String },
          enabled: { type: Boolean },
        },
      ],
      hostname: { type: String },
      power_state: { type: String },
      bmc: {
        status: { type: String },
        version: { type: String },
        mac: { type: String },
        // hostname: { type: String },
        vlan: { type: String },
        ip: { type: String },
        type: { type: String },
        gateway: { type: String },
        subnet_mask: { type: String },
        dns: { type: Array },
      },
      network: [
        {
          adapter: { type: String },
          ports: [
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
        // size: { type: String },
        // speed: { type: String },
        total_size_MiB: { type: Number },
        total_NV_size_MiB: { type: Number },
        total_V_size_MiB: { type: Number },
        speed_MHz: { type: Number },
        dimms: [
          {
            name: { type: String },
            status: { type: String },
            speed_MHz: { type: Number },
            module_type: { type: String },
            capacity_MiB: { type: Number },
            error_correction: { type: String },
            manufacturer: { type: String },
            memory_type: { type: String },
            memory_modes: [String],
            volatile_size_MiB: { type: Number },
            non_volatile_size_MiB: { type: Number },
            write_endurance_percent: { type: Number }, // also can be null
          },
        ],
      },
      processor: {
        status: { type: String },
        model: { type: String },
        count: { type: Number },
        physical_cores: { type: Number },
        logical_cores: { type: Number },
        processors: [
          {
            status: { type: String },
            architecture: { type: String },
            manufacturer: { type: String },
            max_frequency: { type: Number },
            model: { type: String },
            operating_speed_MHz: { type: Number },
            socket: { type: String },
            total_cores: { type: Number },
            total_threads: { type: Number },
            turbo: { type: String },
          },
        ],
      },
      gpus: [
        {
          status: { type: String },
          manufacturer: { type: String },
          model: { type: String },
        },
      ],
      storage: [
        {
          name: { type: String },
          model: { type: String },
          status: { type: String },
          speed: { type: Number },
          slot_count: { type: Number },
          firmware: { type: String },
          drives: [
            {
              status: { type: String },
              slot: { type: String },
              capacity: { type: Number },
              type: { type: String },
              name: { type: String },
              model: { type: String },
              form_factor: { type: String },
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
          volumes: [
            {
              name: { type: String },
              description: { type: String },
              status: { type: String },
              volume_type: { type: String },
              raid_type: { type: String },
              capacity: { type: Number },
            },
          ],
        },
      ],
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
    warranty: {
      shipDate: { type: String },
      productLineDescription: { type: String },
      entitlements: [
        {
          itemNumber: { type: String },
          startDate: { type: String, required: true },
          endDate: { type: String, required: true },
          entitlementType: { type: String },
          serviceLevelCode: { type: String },
          serviceLevelDescription: { type: String },
          serviceLevelGroup: { type: Number },
        },
      ],
    },
  },
  { timestamps: true }
)

const Nodes = mongoose.model("Nodes", nodesSchema)
module.exports = Nodes
