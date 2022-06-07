let config = require("../config")
const mongoose = require("mongoose")

mongoose
  .connect(
    `mongodb://${config.db.host}/${config.db.database}`,
    config.db.options
  )
  .then(() => {
    console.log("Successfully connected to DB")
  })
let db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB Connection Error:"))
