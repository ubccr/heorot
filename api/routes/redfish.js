const express = require("express")
const app = express.Router()

const grendelRequest = require("../modules/grendel")
const {
  biosApi,
  idracApi,
  gpuApi,
  sensorsApi,
  selApi,
  apiClearSEL,
  apiResetBMC,
} = require("../modules/nodeApi")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/redfish/",
    availibleRoutes: routes,
  })
})

app.get("/dell/:node", async (req, res) => {
  const node = req.params.node
  let bmc = ""

  //   GPU check
  let gpu = false
  let grendelRes = await grendelRequest(`/v1/host/find/${node}`)
  let grendelNode = grendelRes.response[0]
  grendelNode.interfaces.forEach((element) => {
    if (element.fqdn.substring(0, 3) === "bmc") bmc = element.fqdn
  })
  if (grendelNode.tags === null) grendelNode.tags = []
  if (grendelNode.tags.includes("gpu")) gpu = true

  let biosRes = await biosApi(bmc)

  let idracRes = await idracApi(bmc)

  let gpuRes = { status: "error", message: "No GPU tag" }
  if (grendelNode.tags.includes("gpu")) gpuRes = await gpuApi(bmc)

  let sensorsRes = await sensorsApi(bmc)

  let selRes = await selApi(bmc)

  res.json({
    status: "success",
    result: { biosRes, idracRes, gpuRes, sensorsRes, selRes },
  })
})

app.get("/sel/:node", async (req, res) => {
  const node = req.params.node
  let bmc = ""
  let grendelRes = await grendelRequest(`/v1/host/find/${node}`)

  if (
    grendelRes.grendelResponse === "success" &&
    grendelRes.response.length !== 0
  ) {
    let grendelNode = grendelRes.response[0]
    grendelNode.interfaces.forEach((element) => {
      if (element.fqdn.substring(0, 3) === "bmc") bmc = element.fqdn
    })

    let selRes = await selApi(bmc)

    res.json({
      status: "success",
      result: { selRes },
    })
  } else {
    res.json({
      status: "error",
      message: "Node not found",
    })
  }
})

app.get("/actions/clearSEL/:node", async (req, res) => {
  let result = await apiClearSEL(req.params.node)

  res.json(result)
})

app.get("/actions/resetBMC/:node", async (req, res) => {
  let result = await apiResetBMC(req.params.node)

  res.json(result)
})

module.exports = app
