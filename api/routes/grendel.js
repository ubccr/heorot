const express = require("express")
const app = express.Router()
const { spawn } = require("child_process")

const grendelRequest = require("../modules/grendel")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/grendel/",
    availibleRoutes: routes,
  })
})

app.get("/host/list", async (req, res) => {
  res.json(await grendelRequest("/v1/host/list"))
})
app.get("/host/find/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/find/${nodeset}`))
})
app.get("/host/tags/:tags", async (req, res) => {
  const tags = req.params.tags
  res.json(await grendelRequest(`/v1/host/tags/${tags}`))
})

app.post("/host", async (req, res) => {
  res.json(await grendelRequest(`/v1/host`, "POST", req.body))
})

app.get("/delete/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/find/${nodeset}`, "DELETE"))
})

app.get("/provision/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/provision/${nodeset}`, "PUT"))
})
app.get("/unprovision/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/unprovision/${nodeset}`, "PUT"))
})
app.get("/tag/:nodeset/:tags", async (req, res) => {
  const nodeset = req.params.nodeset
  const tags = req.params.tags
  res.json(await grendelRequest(`/v1/host/tag/${nodeset}?tags=${tags}`, "PUT"))
})
app.get("/untag/:nodeset/:tags", async (req, res) => {
  const nodeset = req.params.nodeset
  const tags = req.params.tags
  res.json(
    await grendelRequest(`/v1/host/untag/${nodeset}?tags=${tags}`, "PUT")
  )
})
app.get("/test", async (req, res) => {
  let output = {}
  let args = [
    "discover",
    "switch",
    "-c grendel.toml",
    "-b 10.128.0.0",
    "-m mapping.txt",
    "--endpoint swe-v07-22.compute.cbls.ccr.buffalo.edu",
    "--subnet 10.64.0.0",
    "--domain compute.cbls.ccr.buffalo.edu",
  ]
  const ls = spawn("grendel", args, {
    cwd: "/home/ubuntu/dcim/grendel",
    shell: true,
  })
  ls.stdout.on("data", (data) => {
    output.stdout += data
  })

  ls.stderr.on("data", (data) => {
    output.stderr = `stderr: ${data}`
  })

  ls.on("error", (error) => {
    output.error = `error: ${error.message}`
  })

  ls.on("close", (code) => {
    output.close = `child process exited with code ${code}`
    res.json(output.stdout.split("\n"))
  })
})

module.exports = app
