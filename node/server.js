const express = require("express")
const app = express()
const PORT = 3000

const mongoose = require("mongoose")
const nodes = mongoose.model("nodes", {
  node: String,
  u: String,
  type: String,
  rack: String,
})

// HTML Dependencies
app.use(express.static("public"))
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
app.use(
  "/bootstrap-icons",
  express.static(__dirname + "/node_modules/bootstrap-icons/font")
)
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist/js")
)
app.use("/backgrounds", express.static(__dirname + "/backgrounds"))
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"))
app.use("/js", express.static(__dirname + "/js"))

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/data", (req, res) => {
  res.json({
    table: [
      "v05",
      "v06",
      "u25",
      "m25",
      "m26",
      "m27",
      "m28",
      "h22",
      "h23",
      "h24",
      "h25",
    ],
  })
})

app.get("/rack/:rack", async (req, res) => {
  const rack = req.params.rack
  try {
    data = await nodes.find({ rack: rack })
    res.json({
      nodes: data,
    })
  } catch (err) {
    console.log(err)
  }
})

dbConfig = {
  url: "mongodb://mongodb_container:27017/dcim",
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
}

mongoose.Promise = global.Promise
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    user: dbConfig.user,
    pass: dbConfig.pwd,
  })
  .then(() => {
    console.log("successfully connected to the database")
  })
  .catch((err) => {
    console.log("error connecting to the database")
    process.exit()
  })

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
