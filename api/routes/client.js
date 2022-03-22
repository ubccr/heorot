const express = require("express")
const app = express.Router()

const grendelRequest = require("../modules/grendel")

const {
  pduFormat,
  switchFormat,
  nodeFormat,
  quadNodeFormat,
} = require("../modules/client")

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
    let resGrendel = rackRes.response
    let nodes = new Array(43).fill().map((val, index) => {
      return { u: index, type: "" }
    })
    let pdu = new Array(5).fill().map((val, index) => {
      return { pdu: index }
    })

    resGrendel.forEach((element) => {
      let nodeset = element.name.split("-")
      let resPdu,
        resSwitch,
        resNode = {}

      if (nodeset[0] === "srv" || nodeset[0] === "cpn") {
        if (nodeset.length === 4) {
          // quad nodes
          resNode = quadNodeFormat(element, nodeset)
          let u = resNode.u
          let pos = resNode.position

          // set nodes obj to array if not already
          if (typeof nodes[u].node !== "object") nodes[u].node = []
          if (typeof nodes[u].tags !== "object") nodes[u].tags = []

          nodes[u].node[pos] = resNode.node
          nodes[u].tags[pos] = resNode.tags
          nodes[u].height = resNode.height
          nodes[u].width = resNode.width
          nodes[u].type = "node"
        } else {
          // single nodes
          resNode = nodeFormat(element, nodeset)
          if (resNode.height > 1) {
            // multi u node
            let offset = resNode.height - 1
            let offsetU = resNode.u + offset

            nodes[offsetU] = resNode
            nodes[offsetU].u = offsetU
            nodes[offsetU].type = "node"

            for (let i = offset; i > 0; i--) {
              nodes[offsetU - i].type = "rowSpan"
            }
          } else nodes[resNode.u] = resNode
        }
      } else if (nodeset[0] === "swi" || nodeset[0] === "swe") {
        resSwitch = switchFormat(element, nodeset, resGrendel)
      } else if (nodeset[0] === "pdu") {
        resPdu = pduFormat(element, nodeset)
      }
    })

    res.json({
      status: "success",
      rack: rack,
      result: { nodes: nodes, pdu: pdu },
    })

    //   nodes.forEach((element) => {
    //     if (element.name.substring(0, 3) !== "pdu") {
    //       let u = element.name.substring(8, 10)
    //       if (element.name.substring(8, 9) === "0")
    //         u = element.name.substring(9, 10)
    //       let node = { name: element.name, tags: element.tags }

    //       let height = 1
    //       let width = 1
    //       if (element.tags.includes("2u")) height = 2
    //       else if (element.tags.includes("4u")) height = 4
    //       if (element.name.length === 13) width = 2

    //       // --- switch mapping ---
    //       if (element.tags.includes("switch")) {
    //         if (element.name.substring(0, 3) === "swe") {
    //           let mapping = []
    //           let swIp = element.interfaces[0].ip

    //           nodes.forEach((element) => {
    //             if (element.name.substring(0, 3) !== "swe") {
    //               element.interfaces.forEach((iface) => {
    //                 let ip = iface.ip.split(".")
    //                 if (ip[2] === swIp.split(".")[2]) {
    //                   if (mapping[ip[3]] === undefined) {
    //                     mapping[ip[3]] = {
    //                       port: ip[3],
    //                       interface: [iface.fqdn.split(".")[0]],
    //                     }
    //                   } else {
    //                     mapping[ip[3]].interface.push(iface.fqdn.split(".")[0])
    //                   }
    //                 }
    //               })
    //             }
    //           })
    //           result[u] = {
    //             u: u,
    //             switch: element.name,
    //             ports: 54,
    //             mapping: mapping,
    //             height: height,
    //             width: width,
    //           }
    //           // Load empty ports
    //           if (result[u].mapping[54] === undefined)
    //             result[u].mapping[54] = null
    //         } else {
    //           // Infiniband Switches
    //           result[u] = {
    //             u: u,
    //             switch: element.name,
    //             ports: 0,
    //             mapping: {},
    //             height: height,
    //             width: width,
    //           }
    //         }
    //       } else {
    //         // --- node mapping ---
    //         if (result[u] !== undefined) {
    //           result[u].node.push(node)
    //         } else {
    //           result[u] = {
    //             u: u,
    //             node: [node],
    //             height: height,
    //             width: width,
    //           }
    //         }
    //       }
    //     }
    //   })
    //   // Load empty ports
    //   if (result[42] === undefined) result[42] = null

    // } else {
    //   res.json({
    //     status: rackRes.grendelResponse,
    //     result: rackRes.response,
    //     code: rackRes.code,
    //   })
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
