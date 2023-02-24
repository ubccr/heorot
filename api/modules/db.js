let config = require("../config")
const mongoose = require("mongoose")
const Settings = require("../models/Settings")

mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`, config.db.options).then(() => {
  console.log("Successfully connected to DB")
})
let db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB Connection Error:"))

// Create Settings document if it does not exist

Settings.updateOne({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true }, function (error, result) {
  if (error) console.log(error)
  if (result.upsertedCount > 0)
    console.log("Settings document not found in DB, generating and inserting default settings")
})
