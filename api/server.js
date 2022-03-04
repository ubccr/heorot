const express = require("express")
const app = express()

app.get("/", function (req, res) {
  return res.json({ status: "success" })
})

app.listen(3030)
