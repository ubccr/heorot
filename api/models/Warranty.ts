import mongoose from "mongoose"
const Schema = mongoose.Schema
const warrantySchema = new Schema(
  {
    nodeName: { type: String, required: true, unique: true },
    bmcFqdn: { type: String, required: true },
    serviceTag: { type: String, required: true },
    shipDate: { type: String, required: true },
    productLineDescription: { type: String, required: true },
    entitlements: { type: Array },
  },
  { timestamps: true }
)

export const Warranty = mongoose.model("Warranty", warrantySchema)
