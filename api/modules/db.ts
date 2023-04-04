import { Settings } from "../models/Settings.js"
import config from "../../config/config.js"
import { decrypt } from "./encryption.js"
import mongoose from "mongoose"
import { schedule_node_refresh } from "./nodes.js"

export async function connectDB() {
  mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`, config.db.options)
  let db = mongoose.connection
  db.on("error", console.error.bind(console, "MongoDB Connection Error:"))
  console.log("Successfully connected to MongoDB")

  mongoose.set("strictQuery", true)

  // Create Settings document if it does not exist
  let settings_res = await Settings.updateOne({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true })

  if (settings_res.upsertedCount > 0)
    console.log("Settings document not found in DB, generating and inserting default settings")

  await syncDBSettings()
}

export async function syncDBSettings() {
  let settings_res = await Settings.findOne({}, { _id: 0, __v: 0 }, {})
  if (!settings_res) console.error(settings_res)
  else {
    config.settings = settings_res
    config.settings.bmc.password = await decrypt(settings_res.bmc?.password)
    config.settings.switches.password = await decrypt(settings_res.switches?.password)
    config.settings.openmanage.password = await decrypt(settings_res.openmanage?.password)
    config.settings.dell_warranty_api.id = await decrypt(settings_res.dell_warranty_api?.id)
    config.settings.dell_warranty_api.secret = await decrypt(settings_res.dell_warranty_api?.secret)

    schedule_node_refresh()
  }
}
