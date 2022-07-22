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
const {
  fetchOEM,
  dell_managers,
  dell_systems,
  dell_gpu,
  dell_storage,
  sm_systems,
  sm_storage,
  sm_managers,
  sm_gpu,
  hpe_systems,
  hpe_managers,
  hpe_gpu,
  hpe_storage,
} = require("../modules/redfish")

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
  let grendelNode = grendelRes.result[0]
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

  if (grendelRes.status === "success" && grendelRes.result.length !== 0) {
    let grendelNode = grendelRes.result[0]
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

// New Routes

app.get("/v1/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  let oem = await fetchOEM(bmc.address)
  let uri = `https://${bmc.address}`

  if (oem.status === "success") {
    if (oem.OEM === "Dell") {
      //Dell
      let url = {
        uri: uri,
        endpoints: [
          "/redfish/v1/Systems/System.Embedded.1",
          "/redfish/v1/Managers/iDRAC.Embedded.1",
          "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces/NIC.1",
          "/redfish/v1/Systems/System.Embedded.1/Bios",
          "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Entries",
          "",
          "",
        ],
      }
      //call func
    } else if (oem.OEM === "SuperMicro") {
      //SM
      let url = {
        uri: uri,
        endpoints: [
          "/redfish/v1/Systems/1",
          "/redfish/v1/Managers/1",
          "/redfish/v1/Chassis/1",
          "/redfish/v1/Systems/1/LogServices/Log1/Entries",
        ],
      }
      let resAPI = await redfishRequest(url, oem.OEM)
      res.json(resAPI)
      //call func
    } else if (oem.OEM === "HPE") {
      //HPE
      let url = {
        uri: uri,
        endpoints: [
          "/redfish/v1/Chassis/1",
          "/redfish/v1/Managers/1",
          "/redfish/v1/System/1",
          "/redfish/v1/LogServices/IML/Entries",
        ],
      }
      let resAPI = await redfishRequest(url, oem.OEM)
      res.json(resAPI)
      //call func
    }
  }
})

app.get("/v1/systems/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    let oem = await fetchOEM(bmc.address)
    let api_res = new String()

    if (oem.status === "success" && oem.OEM === "Dell")
      api_res = await dell_systems(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "Supermicro")
      api_res = await sm_systems(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "HPE")
      api_res = await hpe_systems(`https://${bmc.address}`)
    else
      res.json({
        status: "error",
        message: "failed to parse OEM from Redfish call",
      })

    res.json(api_res)
  } else res.json(bmc)
})
app.get("/v1/managers/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    let oem = await fetchOEM(bmc.address)
    let api_res = new String()

    if (oem.status === "success" && oem.OEM === "Dell")
      api_res = await dell_managers(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "Supermicro")
      api_res = await sm_managers(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "HPE")
      api_res = await hpe_managers(`https://${bmc.address}`)
    else
      res.json({
        status: "error",
        message: "failed to parse OEM from Redfish call",
      })

    res.json(api_res)
  } else res.json(bmc)
})

app.get("/v1/gpu/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    let oem = await fetchOEM(bmc.address)
    let api_res = new String()

    if (oem.status === "success" && oem.OEM === "Dell")
      api_res = await dell_gpu(`https://${bmc.address}`, oem.version)
    else if (oem.status === "success" && oem.OEM === "Supermicro")
      api_res = await sm_gpu(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "HPE")
      api_res = await hpe_gpu(`https://${bmc.address}`)
    else
      res.json({
        status: "error",
        message: "failed to parse OEM from Redfish call",
      })

    res.json(api_res)
  } else res.json(bmc)
})

app.get("/v1/storage/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    let oem = await fetchOEM(bmc.address)
    let api_res = new String()

    if (oem.status === "success" && oem.OEM === "Dell")
      api_res = await dell_storage(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "Supermicro")
      api_res = await sm_storage(`https://${bmc.address}`)
    else if (oem.status === "success" && oem.OEM === "HPE")
      api_res = await hpe_storage(`https://${bmc.address}`)
    else
      res.json({
        status: "error",
        message: "failed to parse OEM from Redfish call",
      })

    res.json(api_res)
  } else res.json(bmc)
})

app.get("/fetchOEM/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  res.json(await fetchOEM(bmc.address))
})

async function getBMC(node) {
  let bmcInterface = ""
  let grendelRes = await grendelRequest(`/v1/host/find/${node}`)
  if (grendelRes.result.length > 0) {
    let grendelNode = grendelRes.result[0]
    grendelNode.interfaces.forEach((element) => {
      if (element.bmc === true) {
        if (element.fqdn !== "") bmcInterface = element.fqdn
        else bmcInterface = element.ip
      }
    })

    return {
      status: grendelRes.status,
      address: bmcInterface,
      node: grendelNode,
    }
  } else {
    return {
      status: "error",
      message: `No hosts matching ${node} found`,
    }
  }
}

module.exports = app
