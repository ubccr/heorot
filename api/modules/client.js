// TODO: pdu integration
function pduFormat(grendel, nodeset) {}

function switchFormat(grendel, nodeset, rackGrendel) {
  let ip = grendel.interfaces[0].ip.split(".")
  let vlan = ip[2]
  let ports = []
  rackGrendel.forEach((val, index) => {
    val.interfaces.forEach((element, index) => {
      let ip = element.ip.split(".")
      const types = ["swi", "swe"]
      if (ip[2] === vlan && !types.includes(val.name.substring(0, 3))) {
        if (ports[ip[3]] == null) ports[ip[3]] = []
        let bmc = false
        if (element.fqdn.substring(0, 3) === "bmc") bmc = true
        ports[ip[3]].push({
          node: val.name,
          interface: element.fqdn,
          ip: element.ip,
          port: parseInt(ip[3]),
          index: index,
          bmc: bmc,
        })
      }
    })
  })
  if (ports.length > 0 && ports[47] === undefined) ports[47] = null
  return {
    u: parseInt(nodeset[2]),
    node: grendel.name,
    ports: ports,
    tags: grendel.tags,
    height: 1,
    width: 1,
    type: "switch",
  }
}

function nodeFormat(grendel, nodeset) {
  let height = 1
  // multi height nodes
  if (grendel.tags.includes("2u")) height = 2
  else if (grendel.tags.includes("3u")) height = 3
  else if (grendel.tags.includes("4u")) height = 4
  else if (grendel.tags.includes("10u")) height = 10
  return {
    u: parseInt(nodeset[2]),
    node: grendel.name,
    tags: grendel.tags,
    height: height,
    width: 1,
    type: "node",
  }
}

function quadNodeFormat(grendel, nodeset) {
  return {
    u: parseInt(nodeset[2]),
    position: parseInt(nodeset[3]) - 1,
    node: grendel.name,
    tags: grendel.tags,
    height: 1,
    width: 2,
    type: "node",
  }
}

module.exports = { pduFormat, switchFormat, nodeFormat, quadNodeFormat }
