const mongoose = require("mongoose")
const Schema = mongoose.Schema
const crypto = require("crypto")
// require("mongoose-String")(mongoose)

const settingsSchema = new Schema(
  {
    bmc: {
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      firmware_versions: {
        type: [{ name: { type: String }, model: { type: String }, bios: { type: String }, bmc: { type: String } }],
        default: [
          { name: "Dell 15th Gen", model: "(R|C)[0-9]5[0-9]{1,2}", bios: "1.8.2", bmc: "6.10.30.00" },
          { name: "Dell 15th Gen - AMD", model: "(R|C)[0-9]5[0-9]5", bios: "2.9.3", bmc: "6.10.30.00" },
          { name: "Dell 14th Gen", model: "(R|C)[0-9]4[0-9]{1,2}", bios: "2.17.1", bmc: "6.10.30.00" },
          { name: "Dell 14th Gen - R240 & R340", model: "R[2-3]40", bios: "2.12.2", bmc: "6.10.30.00" },
          { name: "Dell 13th Gen", model: "(R|C)[0-9]3[0-9]{1,2}", bios: "2.15.0", bmc: "2.83.83.83" },
          { name: "Dell 12th Gen", model: "(R|C)[0-9]2[0-9]{1,2}", bios: "2.9.0", bmc: "2.65.65.65" },
        ],
      },
    },
    switches: {
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      private_key_path: { type: String, default: "" },
    },
    openmanage: {
      username: { type: String, default: "" },
      password: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    dell_warranty_api: {
      id: { type: String, default: "" },
      secret: { type: String, default: "" },
    },
    jwt_secret: { type: String, default: crypto.randomBytes(16).toString("hex") },
    boot_firmware: {
      type: [String],
      default: ["ipxe.pxe", "ipxe-i386.efi", "ipxe-x86_64.efi", "snponly-x86_64.efi", "undionly.kpxe"],
    },
    floorplan: {
      tag_mapping: {
        type: [{ tag: { type: String, default: "" }, color: { type: String } }],
        default: [
          { tag: "ubhpc", color: "primary" },
          { tag: "faculty", color: "success" },
        ],
      },
      tag_multiple: {
        tag: { type: String, default: "mixed" },
        color: { type: String, default: "error" },
      },
      default_color: { type: String, default: "primary" },
      secondary_color: { type: String, default: "floorplan" },
      model_color: {
        type: [{ display: { type: String }, color: { type: String }, model: { type: String } }],
        default: [
          { display: "No Management Switch", color: "primary", model: "/^S/" },
          { display: "Management Switch", color: "error", model: "/^PC/" },
        ],
      },
      version_color: {
        type: [{ display: { type: String }, color: { type: String }, version: { type: String } }],
        default: [
          { display: "OS8", color: "error", version: "/^8/" },
          { display: "OS9", color: "warning", version: "/^9/" },
          { display: "OS10", color: "primary", version: "/^10/" },
        ],
      },
      floorX: { type: [String], default: [..."defghijklmnopqrstuvw"] },
      floorY: {
        type: [String],
        default: [
          "28",
          "27",
          "26",
          "25",
          "24",
          "23",
          "22",
          "21",
          "17",
          "16",
          "15",
          "14",
          "13",
          "12",
          "11",
          "10",
          "09",
          "08",
          "07",
          "06",
          "05",
        ],
      },
    },
    rack: {
      max: { type: Number, default: 42 },
      min: { type: Number, default: 1 },
      prefix: {
        type: [{ type: { type: String }, prefix: { type: [String] } }],
        default: [
          { type: "switch", prefix: ["swe", "swi"] },
          { type: "node", prefix: ["cpn", "srv"] },
          { type: "pdu", prefix: ["pdu"] },
        ],
      },
      node_size: {
        type: [{ models: { type: [String] }, height: { type: Number }, width: { type: Number } }],
        default: [
          { models: ["R2", "R3", "R4", "R6", "C4"], height: 1, width: 1 },
          { models: ["R5", "R7", "R8"], height: 2, width: 1 },
          { models: ["R9"], height: 4, width: 1 },
          { models: ["C6"], height: 1, width: 2 },
        ],
      },
    },
  },
  { capped: { size: 1024, max: 1, autoIndexId: true }, _id: false }
)
const Settings = mongoose.model("Settings", settingsSchema)
module.exports = Settings
