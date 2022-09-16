const express = require("express")
const app = express.Router()
const fs = require("fs")

const { setCache, getCache, timeComp } = require("../modules/cache")
const { getSwInfoV2 } = require("../modules/switches")

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
