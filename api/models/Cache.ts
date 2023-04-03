import mongoose from "mongoose"
const Schema = mongoose.Schema
const cacheSchema = new Schema(
  {
    node: { type: String, required: true, unique: true },
    cache: { type: Object, required: true },
  },
  { timestamps: true }
)

export const Cache = mongoose.model("Cache", cacheSchema)
