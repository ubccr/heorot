const { json } = require("express")
const express = require("express")
const app = express.Router()
const fs = require("fs")
const fetch = require("node-fetch")

const config = require("../config")
const { grendelRequest, getBMC } = require("../modules/grendel")

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

app.get("/v1/interfaces/:node", async (req, res) => {
  const node = req.params.node
  // let bmc = await getBMC(node)
  // if (bmc.status === "success") {
  let headers = {
    "x-api-key": config.netpalm.apiKey,
    "Content-Type": "application/json",
  }
  let payload = {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      script: "generic_query",
      args: {
        driver: "dellos10",
        hostname: `${node}.compute.cbls.ccr.buffalo.edu`,
        username: config.netpalm.swUser,
        password: config.netpalm.swPass,
      },
      queue_strategy: "fifo",
    }),
  }
  let swRes = await await (await fetch(`${config.netpalm.url}/script`, payload)).json()
  if (swRes.status === "success") {
    let taskRes = new Object()
    for (let attempts = 0; attempts < 12; attempts++) {
      taskRes = await await (await fetch(`${config.netpalm.url}/task/${swRes.data.task_id}`, { headers })).json()
      if (taskRes.status === "success" && taskRes.data.task_status === "finished") {
        break
      } else if (taskRes.detail === "Not Found") {
        taskRes = {
          status: "error",
          message: "Job failed",
        }
        break
      } else
        await new Promise((resolve) => {
          setTimeout(resolve, 5000)
        })
    }
    res.json(taskRes)
  } else res.json(swRes)
  // } else res.json(bmc)
})

app.get("/v1/command/:node/:command", async (req, res) => {
  const SSH2Promise = require("ssh2-promise")
  const node = req.params.node
  const command = parseInt(req.params.command)
  let output = new Object()
  let cmdNumber = 0

  if (typeof command === "number") cmdNumber = command
  else {
    if (command === "version") {
      cmdNumber = 0
    } else if (command === "interfaces") {
      cmdNumber = 1
    } else if (command === "mac-address-table") {
      cmdNumber = 2
    }
  }

  let swRes = await getSwInfo(node, cmdNumber)

  if (swRes.status === "success") {
    const grendel = swRes.result[0]
    let SSHConfig = {
      host: grendel.interfaces[0].fqdn,
      port: 22,
      username: config.netpalm.swUser,
      tryKeyboard: true,
      password: config.netpalm.swPass,
      // privateKey: fs.readFileSync("./keys/bmc.key"),
      algorithms: {
        kex: [
          "curve25519-sha256",
          "curve25519-sha256@libssh.org",
          "ecdh-sha2-nistp256",
          "ecdh-sha2-nistp384",
          "ecdh-sha2-nistp521",
          "diffie-hellman-group-exchange-sha256",
          "diffie-hellman-group14-sha256",
          "diffie-hellman-group15-sha512",
          "diffie-hellman-group16-sha512",
          "diffie-hellman-group17-sha512",
          "diffie-hellman-group18-sha512",
          // older algos for HPE nodes
          "diffie-hellman-group14-sha1",
          "diffie-hellman-group1-sha1",
        ],
      },
    }
    let conn = new SSH2Promise(SSHConfig)

    try {
      await conn.connect()
      let data = await conn.exec(swRes.command)
      output.status = "success"
      output.data = parseOutput(swRes.parseType, data)

      conn.close()

      res.json(output)
    } catch (err) {
      res.json(err)
    }
  } else {
    res.json(swRes)
  }
})

const getSwInfo = async (node, cmdNumber) => {
  const cmdListOS10 = ["show version", "show interface status", "show mac address-table"]
  const cmdListOS9 = ["show version", "show interfaces status", "show mac-address-table"]
  const grendel = await grendelRequest(`/v1/host/find/${node}`)

  if (grendel.result.length === 0) {
    return { status: "error", message: "No matching node name found in Grendel" }
  }
  if (grendel.status !== "success") {
    return { status: "error", message: grendel.result }
  }
  let grendelInfo = grendel.result[0]
  if (grendelInfo.tags.includes("Dell_OS10")) {
    output = {
      command: cmdListOS10[cmdNumber],
      parseType: "OS10",
    }
  } else if (grendelInfo.tags.includes("Dell_OS9")) {
    output = {
      command: cmdListOS9[cmdNumber],
      parseType: "OS9",
    }
  } else if (grendelInfo.tags.includes("Dell_OS8")) {
    // TODO: add OS8 support
    // change credentials
    return { status: "error", message: "Dell OS8 queries not supported" }
  }
  return { ...output, ...grendel }
}

const parseOutput = (type, data) => {
  if (type === "OS10") {
    return data.split("\n").map((val) => val.split("\t").filter(String))
  } else if (type === "OS9") {
    return data.split("\r\n").map((val) => val.split("\t").filter(String))
  }
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
