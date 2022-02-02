const express = require("express")
const app = express()
const PORT = 3000

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
app.get("/rack/:rack", (req, res) => {
  const rack = req.params.rack
  res.json({
    nodes: [
      { node: "cpn-" + rack + "-33", u: "33", type: "R750" },
      { node: "cpn-" + rack + "-31", u: "31", type: "R750" },
      { node: "cpn-" + rack + "-29", u: "29", type: "R750" },
      { node: "cpn-" + rack + "-26", u: "26", type: "R650" },
      { node: "cpn-" + rack + "-25", u: "25", type: "R650" },
      { node: "cpn-" + rack + "-24", u: "24", type: "R650" },
      { node: "cpn-" + rack + "-23", u: "23", type: "R650" },
    ],
  })
})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
