const express = require("express")
const app = express.Router()

// TODO: Deprecate
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

const { redfish_auth, redfish_logout } = require("../modules/redfish/auth")
const {
  dell_systems,
  sm_systems,
  hpe_systems,
} = require("../modules/redfish/systems")
const {
  dell_managers,
  sm_managers,
  hpe_managers,
} = require("../modules/redfish/managers")
const { dell_sel, sm_sel, hpe_sel } = require("../modules/redfish/sel")
const { dell_gpu, sm_gpu, hpe_gpu } = require("../modules/redfish/gpu")
const {
  dell_storage,
  sm_storage,
  hpe_storage,
} = require("../modules/redfish/storage")
const {
  dell_clearSel,
  sm_clearSel,
  hpe_clearSel,
} = require("../modules/redfish/clearSel")
const {
  dell_resetBmc,
  sm_resetBmc,
  hpe_resetBmc,
} = require("../modules/redfish/resetBmc")

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

// TODO: Deprecate
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
// TODO: Deprecate
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
// TODO: Deprecate
app.get("/actions/clearSEL/:node", async (req, res) => {
  let result = await apiClearSEL(req.params.node)

  res.json(result)
})
// TODO: Deprecate
app.get("/actions/resetBMC/:node", async (req, res) => {
  let result = await apiResetBMC(req.params.node)

  res.json(result)
})

// New Routes

app.get("/v1/systems/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      let api_res = new String()

      if (auth.oem === "Dell") api_res = await dell_systems(uri, auth.token)
      else if (auth.oem === "Supermicro")
        api_res = await sm_systems(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_systems(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.get("/v1/managers/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      let api_res = new String()

      if (auth.oem === "Dell") api_res = await dell_managers(uri, auth.token)
      else if (auth.oem === "Supermicro")
        api_res = await sm_managers(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_managers(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.get("/v1/gpu/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      let api_res = new String()

      if (auth.oem === "Dell")
        api_res = await dell_gpu(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro")
        api_res = await sm_gpu(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_gpu(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.get("/v1/storage/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      let api_res = new String()

      if (auth.oem === "Dell")
        api_res = await dell_storage(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro")
        api_res = await sm_storage(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_storage(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.get("/v1/sel/:node", async (req, res) => {
  const node = req.params.node

  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      if (auth.oem === "Dell")
        api_res = await dell_sel(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro")
        api_res = await sm_sel(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_sel(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.put("/v1/clearSel/:node", async (req, res) => {
  const node = req.params.node

  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      if (auth.oem === "Dell") api_res = await dell_clearSel(uri, auth.token)
      else if (auth.oem === "Supermicro")
        api_res = await sm_clearSel(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_clearSel(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
})

app.put("/v1/resetBmc/:node", async (req, res) => {
  const node = req.params.node

  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      if (auth.oem === "Dell") api_res = await dell_resetBmc(uri, auth.token)
      else if (auth.oem === "Supermicro")
        api_res = await sm_resetBmc(uri, auth.token)
      else if (auth.oem === "HPE") api_res = await hpe_resetBmc(uri, auth.token)
      else
        api_res = {
          status: "error",
          message: "failed to parse OEM from Redfish call",
        }

      await redfish_logout(auth.location, uri, auth.token)
      res.json(api_res)
    } else res.json(auth)
  } else res.json(bmc)
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
