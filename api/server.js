const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// require("dotenv").config()

// MongoDB database connection
require("./modules/db")
const User = require("./models/User")

// TODO: verify functionality
require("./modules/console")

app.get("/", function (req, res) {
  return res.json({ status: "success" })
})
// --- routes ---
const authRouter = require("./routes/auth.js")
app.use("/auth", authRouter)

const clientRouter = require("./routes/client.js")
app.use("/client", clientRouter)

const redfishRouter = require("./routes/redfish.js")
app.use("/redfish", redfishRouter)

const grendelRouter = require("./routes/grendel.js")
app.use("/grendel", grendelRouter)

app.get("/all", async function (req, res) {
  let query = await User.find().exec()

  res.json({ status: "success", query })
})

app.listen(3030)
