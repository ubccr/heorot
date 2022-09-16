const mongoose = require("mongoose")
const Schema = mongoose.Schema
const switchesSchema = new Schema(
  {
    node: { type: String, required: true, unique: true },
    cache: { type: Object, required: true },
  },
  { timestamps: true }
)

const Switches = mongoose.model("Switches", switchesSchema)
module.exports = Switches
