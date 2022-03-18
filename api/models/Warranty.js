const mongoose = require("mongoose")
const Schema = mongoose.Schema
const warrantySchema = new Schema(
  {
    serviceTag: { type: String, required: true },
    shipData: { type: String, required: true },
    productLineDescription: { type: String, required: true },
    serviceTag: { type: String, required: true },
    entitlements: [
      { startDate: { type: String, required: true } },
      { endDate: { type: String, required: true } },
      { entitlementType: { type: String, required: true } },
      { serviceLevelCode: { type: String, required: true } },
      { serviceLevelDescription: { type: String, required: true } },
    ],
  },
  { timestamps: true }
)

const Warranty = mongoose.model("Warranty", warrantySchema)
module.exports = Warranty
