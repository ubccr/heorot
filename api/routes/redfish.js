const express = require("express")
const app = express.Router()

// TODO: Deprecate
const { getBMC } = require("../modules/grendel")
const { redfish_auth, redfish_logout } = require("../modules/redfish/auth")
const { dell_systems, sm_systems, hpe_systems } = require("../modules/redfish/systems")
const { dell_managers, sm_managers, hpe_managers } = require("../modules/redfish/managers")
const { dell_sel, sm_sel, hpe_sel } = require("../modules/redfish/sel")
const { dell_gpu, sm_gpu, hpe_gpu } = require("../modules/redfish/gpu")
const { dell_storage, sm_storage, hpe_storage } = require("../modules/redfish/storage")
const { dell_clearSel, sm_clearSel, hpe_clearSel } = require("../modules/redfish/clearSel")
const { dell_resetBmc, sm_resetBmc, hpe_resetBmc } = require("../modules/redfish/resetBmc")
const { dell_resetNode, sm_resetNode, hpe_resetNode } = require("../modules/redfish/resetNode")

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

app.get("/v1/systems/:node", async (req, res) => {
  const node = req.params.node
  let bmc = await getBMC(node)
  if (bmc.status === "success") {
    const uri = `https://${bmc.address}`
    let auth = await redfish_auth(uri)
    if (auth.status === "success") {
      let api_res = new String()

      if (auth.oem === "Dell") api_res = await dell_systems(uri, auth.token)
      else if (auth.oem === "Supermicro") api_res = await sm_systems(uri, auth.token)
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
      else if (auth.oem === "Supermicro") api_res = await sm_managers(uri, auth.token)
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

      if (auth.oem === "Dell") api_res = await dell_gpu(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro") api_res = await sm_gpu(uri, auth.token)
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

      if (auth.oem === "Dell") api_res = await dell_storage(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro") api_res = await sm_storage(uri, auth.token)
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
      if (auth.oem === "Dell") api_res = await dell_sel(uri, auth.token, auth.version)
      else if (auth.oem === "Supermicro") api_res = await sm_sel(uri, auth.token)
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
  const node = req.params.node.split(",")

  let response = await Promise.all(
    node.map(async (val) => {
      let bmc = await getBMC(val)
      if (bmc.status === "success") {
        const uri = `https://${bmc.address}`
        let auth = await redfish_auth(uri)
        if (auth.status === "success") {
          if (auth.oem === "Dell") api_res = await dell_clearSel(uri, auth.token)
          else if (auth.oem === "Supermicro") api_res = await sm_clearSel(uri, auth.token)
          else if (auth.oem === "HPE") api_res = await hpe_clearSel(uri, auth.token)
          else
            api_res = {
              status: "error",
              message: "failed to parse OEM from Redfish call",
            }
          await redfish_logout(auth.location, uri, auth.token)
          return api_res
        } else return auth
      } else return bmc
    })
  )
  let errors = response.filter((val) => val.status === "error")
  let successes = response.filter((val) => val.status === "success")
  let status = "success"
  let message = ""

  if (response.length === 1) res.json(response[0])
  else {
    if (successes.length >= 1) message += `Successfully cleared SEL on ${successes.length} node(s). `
    if (errors.length >= 1) {
      status = "error"
      message += `${errors.length} node(s) failed. (see browser console for details)`
    }
    res.json({ status: status, message: message, error: errors })
  }
})

app.put("/v1/resetBmc/:node", async (req, res) => {
  const node = req.params.node.split(",")

  let response = await Promise.all(
    node.map(async (val) => {
      let bmc = await getBMC(val)
      if (bmc.status === "success") {
        const uri = `https://${bmc.address}`
        let auth = await redfish_auth(uri)
        if (auth.status === "success") {
          if (auth.oem === "Dell") api_res = await dell_resetBmc(uri, auth.token)
          else if (auth.oem === "Supermicro") api_res = await sm_resetBmc(uri, auth.token)
          else if (auth.oem === "HPE") api_res = await hpe_resetBmc(uri, auth.token)
          else
            api_res = {
              status: "error",
              message: "failed to parse OEM from Redfish call",
            }

          await redfish_logout(auth.location, uri, auth.token)
          return api_res
        } else return auth
      } else return bmc
    })
  )
  let errors = response.filter((val) => val.status === "error")
  let successes = response.filter((val) => val.status === "success")
  let status = "success"
  let message = ""

  if (response.length === 1) res.json(response[0])
  else {
    if (successes.length >= 1) message += `Successfully reset the BMC on ${successes.length} node(s). `
    if (errors.length >= 1) {
      status = "error"
      message += `${errors.length} node(s) failed. (see browser console for details)`
    }
    res.json({ status: status, message: message, error: errors })
  }
})

app.put("/v1/resetNode/:node/:pxe?", async (req, res) => {
  const node = req.params.node.split(",")
  const pxe = req.params.pxe ?? "false"

  let response = await Promise.all(
    node.map(async (val) => {
      let bmc = await getBMC(val)
      if (bmc.status === "success") {
        const uri = `https://${bmc.address}`
        let auth = await redfish_auth(uri)
        if (auth.status === "success") {
          if (auth.oem === "Dell") api_res = await dell_resetNode(uri, auth.token, pxe)
          else if (auth.oem === "Supermicro") api_res = await sm_resetNode(uri, auth.token, pxe)
          else if (auth.oem === "HPE") api_res = await hpe_resetNode(uri, auth.token, pxe)
          else
            api_res = {
              status: "error",
              message: "failed to parse OEM from Redfish call",
            }

          await redfish_logout(auth.location, uri, auth.token)
          return api_res
        } else return auth
      } else return bmc
    })
  )

  let errors = response.filter((val) => val.status === "error")
  let successes = response.filter((val) => val.status === "success")
  let status = "success"
  let message = ""

  if (response.length === 1) res.json(response[0])
  else {
    if (successes.length >= 1) message += `Successfully power cycled ${successes.length} node(s). `
    if (errors.length >= 1) {
      status = "error"
      message += `${errors.length} node(s) failed. (see browser console for details)`
    }
    res.json({ status: status, message: message, error: errors })
  }
})

module.exports = app
