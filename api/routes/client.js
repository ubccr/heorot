const express = require("express")
const app = express.Router()

const grendelRequest = require("../modules/grendel")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/client/",
    availibleRoutes: routes,
  })
})

app.get("/rack/:rack", async (req, res) => {
  const rack = req.params.rack
  let rackRes = await grendelRequest(`/v1/host/tags/${rack}`)
  if (rackRes.grendelResponse === "success") {
    let nodes = rackRes.response
    let result = []

    nodes.forEach((element) => {
      if (element.name.substring(0, 3) !== "pdu") {
        let u = element.name.substring(8, 10)
        if (element.name.substring(8, 9) === "0")
          u = element.name.substring(9, 10)
        let node = { name: element.name, tags: element.tags }

        let height = 1
        let width = 1
        if (element.tags.includes("2u")) height = 2
        else if (element.tags.includes("4u")) height = 4
        if (element.name.length === 13) width = 2

        // --- switch mapping ---
        if (element.tags.includes("switch")) {
          if (element.name.substring(0, 3) === "swe") {
            let mapping = []
            let swIp = element.interfaces[0].ip

            nodes.forEach((element) => {
              if (element.name.substring(0, 3) !== "swe") {
                element.interfaces.forEach((iface) => {
                  let ip = iface.ip.split(".")
                  if (ip[2] === swIp.split(".")[2]) {
                    if (mapping[ip[3]] === undefined) {
                      mapping[ip[3]] = {
                        port: ip[3],
                        interface: [iface.fqdn.split(".")[0]],
                      }
                    } else {
                      mapping[ip[3]].interface.push(iface.fqdn.split(".")[0])
                    }
                  }
                })
              }
            })
            result[u] = {
              u: u,
              switch: element.name,
              ports: 54,
              mapping: mapping,
              height: height,
              width: width,
            }
            // Load empty ports
            if (result[u].mapping[54] === undefined)
              result[u].mapping[54] = null
          } else {
            // Infiniband Switches
            result[u] = {
              u: u,
              switch: element.name,
              ports: 0,
              mapping: {},
              height: height,
              width: width,
            }
          }
        } else {
          // --- node mapping ---
          if (result[u] !== undefined) {
            result[u].node.push(node)
          } else {
            result[u] = {
              u: u,
              node: [node],
              height: height,
              width: width,
            }
          }
        }
      }
    })
    // Load empty ports
    if (result[42] === undefined) result[42] = null
    res.json({ status: "success", rack: rack, result: result })
  } else {
    res.json({
      status: rackRes.grendelResponse,
      result: rackRes.response,
      code: rackRes.code,
    })
  }
})

app.get("/node/:node", async (req, res) => {
  const node = req.params.node
  let result = []

  let nodeRes = await grendelRequest(`/v1/host/find/${node}`)
  if (nodeRes.grendelResponse === "success") {
    let nodes = nodeRes.response

    nodes.forEach((element) => {
      result.push(element)
    })

    res.json({ status: "success", node: node, result: result })
  } else {
    res.json({
      status: nodeRes.grendelResponse,
      result: nodeRes.response,
      code: nodeRes.code,
    })
  }
})

module.exports = app
