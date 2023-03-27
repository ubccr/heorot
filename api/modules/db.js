let config = require("../../config/config")
const mongoose = require("mongoose")
const Settings = require("../models/Settings")
const { decrypt } = require("./encryption")
const { schedule_node_refresh } = require("./nodes")

mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`, config.db.options).then(() => {
  console.log("Successfully connected to DB")
})
let db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB Connection Error:"))

mongoose.set("strictQuery", true)

// Create Settings document if it does not exist

Settings.updateOne({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true }, function (error, result) {
  if (error) console.log(error)
  if (result.upsertedCount > 0)
    console.log("Settings document not found in DB, generating and inserting default settings")
})

async function syncDBSettings() {
  Settings.findOne({}, { _id: 0, __v: 0 }, {}, async (err, res) => {
    if (err) console.error(err)
    else {
      config.settings = res
      config.settings.bmc.password = await decrypt(res.bmc.password)
      config.settings.switches.password = await decrypt(res.switches.password)
      config.settings.openmanage.password = await decrypt(res.openmanage.password)
      config.settings.dell_warranty_api.id = await decrypt(res.dell_warranty_api.id)
      config.settings.dell_warranty_api.secret = await decrypt(res.dell_warranty_api.secret)

      schedule_node_refresh()
    }
  })
}

syncDBSettings()

module.exports = { syncDBSettings }
