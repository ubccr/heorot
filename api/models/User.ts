import mongoose from "mongoose"
const Schema = mongoose.Schema
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    privileges: { type: String, required: true },
    background: { type: String, required: true },
    theme: { type: String, required: true },
  },
  { timestamps: true }
)

export const User = mongoose.model("User", userSchema)
