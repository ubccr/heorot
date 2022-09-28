const mongoose = require("mongoose")
const Schema = mongoose.Schema
const redfishSchema = new Schema(
  {
    node: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    serviceTag: { type: String, required: true, unique: true },
    biosVersion: { type: String, required: true },
    bmcVersion: { type: String, required: true },
    vlan: { type: String, required: true },
    bootOrder: { type: String, required: true },
    memorySize: { type: String, required: true },
  },
  { timestamps: true }
)

const Redfish = mongoose.model("Redfish", redfishSchema)
module.exports = Redfish
