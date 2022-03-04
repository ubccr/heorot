require("dotenv").config()

const mongoose = require("mongoose")

const config = {
  host: "localhost",
  database: "dcim",
  options: {
    auth: { authSource: "admin" },
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
  },
}
mongoose
  .connect(`mongodb://${config.host}/${config.database}`, config.options)
  .then(() => {
    console.log("Successfully connected to DB")
  })
let db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB Connection Error:"))
