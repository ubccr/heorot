const mongoose = require("mongoose")
const Schema = mongoose.Schema
const nodesSchema = new Schema(
  {
    nodeName: { type: String, required: true },
    bmcFqdn: { type: String, required: true },
    serviceTag: { type: String, required: true },
    serviceTag: { type: String, required: true },
    serviceTag: { type: String, required: true },
    serviceTag: { type: String, required: true },
  },
  { timestamps: true }
)

const Nodes = mongoose.model("Nodes", nodesSchema)
module.exports = Nodes
