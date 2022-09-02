const express = require("express")
const app = express.Router()
const fs = require("fs")

const { grendelRequest } = require("../modules/grendel")
const { getSwInfo } = require("../modules/switches")

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

app.get("/coreSwitch/:node", async (req, res) => {
  const node = req.params.node

  const jsonData = readJsonFile()
  if (jsonData.status !== "success") {
    res.json(jsonData)
    return
  }

  let portMapping = new Array()

  for (blade = 7; blade <= 10; blade++) {
    portMapping[blade] = new Array()
    for (port = 1; port <= 36; port++) {
      portMapping[blade][port] = new Object({
        mapping: new Array(5),
        uplinkSpeed: null,
      })
    }
  }

  const grendel = await grendelRequest(`/v1/host/find/${node}`)
  if (grendel.result.length === 0) {
    res.json({ status: "error", message: "No matching node name found in Grendel" })
    return
  }
  if (grendel.status !== "success") {
    res.json({ status: "error", message: grendel.result })
    return
  }
  let grendelInfo = grendel.result[0]
  if (!grendelInfo.tags.includes("core-switch")) {
    res.json({ status: "error", message: "Node name supplied does not have matching 'core-switch' tag" })
    return
  }
  // Height functoin
  let height =
    grendelInfo.tags
      .map((e) => {
        if (e[e.length - 1] === "u") return e.slice(0, -1)
      })
      .filter(Boolean)[0] ?? "1"

  // Port function

  jsonData.result.forEach((racks) => {
    racks.switches.forEach((sw) => {
      if (sw.cabling !== undefined) {
        sw.cabling.ports.forEach((port) => {
          let spines = port.spine_port.split("/")
          portMapping[parseInt(spines[0])][parseInt(spines[1])].mapping[parseInt(spines[2])] = {
            hostname: sw.hostname,
            port: port.spine_port,
          }
          portMapping[parseInt(spines[0])][parseInt(spines[1])].uplinkSpeed = racks.uplink_speed
        })
      }
    })
  })

  res.json({ status: "success", height, portMapping })
})

app.get("/rack/:rack", async (req, res) => {
  const rack = req.params.rack
  const jsonData = readJsonFile()
  if (jsonData.status !== "success") {
    res.json(jsonData)
    return
  }

  let data = jsonData.result.find((element) => element.rack === rack)
  if (data === undefined) res.json({ status: "error", message: "Rack not found in dataset" })
  else {
    data.ratio = (data.nodes * data.port_speed) / (data.switches.length * 2 * data.uplink_speed)
    res.json({ status: "success", result: data })
  }
})

app.get("/switch/:rack/:node", async (req, res) => {
  const rack = req.params.rack
  const node = req.params.node
  const jsonData = readJsonFile()
  if (jsonData.status !== "success") {
    res.json(jsonData)
    return
  }

  let data = jsonData.result.find((element) => element.rack === rack)
  if (data === undefined) res.json({ status: "error", message: "Rack not found in dataset" })
  else {
    data.ratio = (data.nodes * data.port_speed) / (data.switches.length * 2 * data.uplink_speed)
    data.switches = data.switches.find((element) => element.hostname === node)
    if (data.switches === undefined)
      res.json({
        status: "error",
        message: "Switch not found in dataset",
      })
    else res.json({ status: "success", result: data })
  }
})

app.get("/v1/version/:node", async (req, res) => {
  const node = req.params.node

  let resSw = await getSwInfo(node, "show version")
  res.json(resSw)
})

app.get("/v1/macAddressTable/:node", async (req, res) => {
  const node = req.params.node

  let resSw = await getSwInfo(node, "show mac address-table")
  res.json(resSw)
})

app.get("/v1/interfaces/:node", async (req, res) => {
  const node = req.params.node

  let resSw = await getSwInfo(node, "show interfaces status")
  res.json(resSw)
})

app.get("/v1/module/:node", async (req, res) => {
  const node = req.params.node

  let resSw = await getSwInfo(node, "show module")
  res.json(resSw)
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
