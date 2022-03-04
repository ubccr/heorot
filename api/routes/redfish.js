const express = require("express")
const app = express.Router()

const grendelRequest = require("../modules/grendel")
const {
  biosApi,
  idracApi,
  gpuApi,
  sensorsApi,
  selApi,
} = require("../modules/nodeApi")

app.get("/", (req, res) => {
  res.json({ status: "success", route: "/redfish/" })
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

  if (grendelNode.tags.includes("gpu")) gpu = true

  let biosRes = await biosApi(bmc)

  let idracRes = await idracApi(bmc)

  let gpuRes = ""
  if (bmc) gpuRes = await gpuApi(bmc)

  let sensorsRes = await sensorsApi(bmc)

  let selRes = await selApi(bmc)

  res.json({ biosRes, idracRes, gpuRes, sensorsRes, selRes })
})

app.get("/:node/sel", async (req, res) => {})

module.exports = app
