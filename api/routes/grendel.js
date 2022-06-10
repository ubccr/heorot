const express = require("express")
const app = express.Router()
const { spawn } = require("child_process")
const fs = require("fs")

let config = require("../config")

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
// TODO: Error testing
app.post("/discover", async (req, res) => {
  let output = {}
  let stdout = ""
  let args = [
    "discover",
    "switch",
    `-c ${config.grendel.configPath}`,
    `-m ${config.grendel.mapping}`,
    `--endpoint ${req.body.sw}.${req.body.domain}`,
    `--domain ${req.body.domain}`,
    `--subnet ${req.body.subnet}`,
    `--bmc-subnet ${req.body.bmcSubnet}`,
  ]
  fs.writeFile(`${config.grendel.mapping}`, req.body.mapping, (err) => {
    if (err) {
      output.status = "error"
      output.error = err
      res.json(output)
      return
    } else {
      const grendel = spawn("grendel", args, {
        shell: true,
      })
      grendel.stdout.on("data", (data) => {
        stdout += data
      })

      grendel.stderr.on("data", (data) => {
        output.error = `stderr: ${data}`
      })

      grendel.on("error", (error) => {
        output.error = `error: ${error.message}`
      })

      grendel.on("close", (code) => {
        if (output.stderr === undefined) {
          try {
            output.node = JSON.parse(stdout)
            output.status = "success"
          } catch (e) {
            output.status = "error"
            output.message = e
          }
        }
        res.json(output)
      })
    }
  })
})

module.exports = app
