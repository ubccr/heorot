const express = require("express")
const app = express()
const cors = require("cors")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())
const auth = require("./modules/auth")

// MongoDB database connection
require("./modules/db")
const User = require("./models/User")

// TODO: verify functionality
require("./modules/console")
app.get("/", function (req, res) {
  res.json({ status: "success" })
})
// --- routes ---
const authRouter = require("./routes/auth.js")
app.use("/auth", authRouter)

const clientRouter = require("./routes/client.js")
app.use("/client", auth, clientRouter)

const redfishRouter = require("./routes/redfish.js")
app.use("/redfish", auth, redfishRouter)

const grendelRouter = require("./routes/grendel.js")
app.use("/grendel", auth, grendelRouter)
const openmanageRouter = require("./routes/openmanage.js")
app.use("/openmanage", auth, openmanageRouter)

app.get("/all", async function (req, res) {
  let query = await User.find().exec()

  res.json({ status: "success", query })
})

app.listen(3030)
