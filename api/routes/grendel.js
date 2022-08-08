const express = require("express")
const app = express.Router()
const { spawn, exec } = require("child_process")
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
// --- hosts ---
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

// --- images ---
app.get("/image/list", async (req, res) => {
  res.json(await grendelRequest(`/v1/bootimage/list`))
})
app.get("/image/find/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/bootimage/find/${nodeset}`))
})
app.post("/image", async (req, res) => {
  res.json(await grendelRequest(`/v1/bootimage`, "POST", req.body))
})
app.delete("/image/delete/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/bootimage/find/${nodeset}`, "DELETE"))
})

// TODO: Error testing
app.post("/discover", async (req, res) => {
  let output = {}
  let stdout = ""
  let args = [
    "discover",
    "switch",
    `-c ${config.grendel.configPath}`,
    `-m ${config.grendel.mappingName}`,
    `--endpoint ${req.body.sw}.${req.body.domain}`,
    `--domain ${req.body.domain}`,
    `--subnet ${req.body.subnet}`,
    `--bmc-subnet ${req.body.bmcSubnet}`,
  ]
  fs.writeFile(`${config.grendel.mappingName}`, req.body.mapping, (err) => {
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

app.get("/status/:value/:tags?", async (req, res) => {
  let tags = req.params.tags === undefined ? "" : req.params.tags
  let args = ["status"]

  if (req.params.value === "nodes") args.push("nodes", `${tags}`)
  else if (req.params.value === "long") args.push("nodes", `${tags}`, "--long")
  else args.push(`${tags}`)

  const status = spawn("grendel", args)
  let stdout = "",
    stderr = "",
    error = ""
  status.stdout.on("data", (data) => {
    stdout += data
  })
  status.stderr.on("data", (data) => {
    stderr += data
  })
  status.on("error", (err) => {
    error = err
    res.json({
      status: "error",
      message: err,
    })
  })
  status.on("close", (code) => {
    if (stderr === "" && error === "") {
      res.json({
        status: "success",
        result: stdout,
      })
    } else {
      console.error({
        status: "error",
        stderr,
        error,
      })
    }
  })
})

app.post("/edit", async (req, res) => {
  const nodeset = req.body.nodeset
  const action = req.body.action
  const value = req.body.value

  let originalJSON = await grendelRequest(`/v1/host/find/${nodeset}`)

  if (originalJSON.status !== "error") {
    let updatedJSON = originalJSON.result.map((val, index) => {
      if (action === "firmware") val.firmware = value
      else if (action === "image") val.boot_image = value
      return val
    })

    let updateNode = await grendelRequest(`/v1/host`, "POST", updatedJSON)
    res.json(updateNode)
  } else {
    res.json({
      status: "error",
      message: originalJSON.result.message,
    })
  }
})

module.exports = app
