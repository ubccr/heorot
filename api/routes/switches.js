const express = require("express")
const app = express.Router()
const fs = require("fs")
const Cache = require("../models/Cache")

const { setCache, getCache, timeComp } = require("../modules/cache")
const { getSwInfoV2 } = require("../modules/switches")
const { grendelRequest } = require("../modules/grendel")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/switches/",
    availibleRoutes: routes,
  })
})

app.get("/allData", async (req, res) => {
  const jsonData = readJsonFile()
  if (jsonData.status !== "success") {
    res.json(jsonData)
    return
  }
  res.json({
    status: "success",
    result: jsonData.result,
  })
})

app.get("/v1/query/:node/:refetch?", async (req, res) => {
  const node = req.params.node
  const refetch = req.params.refetch

  let getCacheRes = await getCache(node)
  if (getCacheRes !== null && refetch !== "true" && getCacheRes.cache.status !== "error") {
    if (timeComp(getCacheRes.updatedAt)) getSw(node)
    res.json(getCacheRes.cache)
  } else {
    let resSw = await getSw(node)
    res.json(resSw)
  }
})
const getSw = async (node) => {
  let res = await getSwInfoV2(node)
  let setCacheRes = await setCache(node, res)

  return res
}

app.get("/v1/refetchAll", async (req, res) => {
  let grendelRes = await grendelRequest(`/v1/host/tags/switch`)

  if (grendelRes.status === "success") {
    let output = await Promise.all(grendelRes.result.map(async (val) => await getSw(val.name)))
    let failed = output
      .map((val) => {
        if (val.status !== "success") return val.message
      })
      .filter(Boolean)

    let status = failed.length > output.length ? "error" : "success"
    let message = `Successfully updated ${output.length} switches, Failed to update ${failed.length} switches`

    res.json({ status, message, result: output, failed })
  } else res.json(grendelRes)
})

app.get("/v1/allSwitches", async (req, res) => {
  let switchesQuery = await Cache.find({ node: /^swe/ })
  if (switchesQuery !== null) {
    let tmp = switchesQuery
      .map((val) => {
        if (val.cache.status !== "error")
          return { node: val.node, status: val.cache.status, info: val.cache.info, result: val.cache.result[0] }
      })
      .filter(Boolean)

    res.json({ status: "success", result: tmp })
  } else res.json({ status: "error", message: "Failed to load cached switches from the DB", silent: true })
})

const readJsonFile = () => {
  try {
    const jsonData = JSON.parse(fs.readFileSync("./keys/switch-data.json"))
    jsonData.forEach((val) => {
      val.ratio = (val.nodes * val.port_speed) / (val.switches.length * 2 * val.uplink_speed)
    })
    let output = {
      status: "success",
      result: jsonData,
    }
    return output
  } catch (e) {
    if (e.errno === -2) e.code = `${e.code} | Error opening '${e.path}'`
    return {
      status: "error",
      message: e.code,
    }
  }
}

module.exports = app
