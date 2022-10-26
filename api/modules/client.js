const config = require("../config.js")
const { fetch_node } = require("./nodes.js")

const rackGen = async (grendel, rackArr, refetch) => {
  let nodes_arr = grendel.result.filter((val) => config.rack.node_prefix.includes(val.name.split("-")[0]))
  let redfish_arr = await Promise.all(nodes_arr.map((val) => fetch_node(val.name, refetch)))

  return rackArr.map((val, index) => {
    let node = grendel.result.filter((n) => parseInt(n.name.split("-")[2]) === val.u && n.name.split("-")[0] !== "pdu")
    let redfish_res = null
    if (node !== undefined) {
      node.forEach((n) => {
        let nodeset = n.name.split("-")
        config.rack.prefix.forEach((p) => {
          val.type = p.prefix.includes(nodeset[0]) ? p.type : val.type
        })
        redfish_res = redfish_arr.find((val) => val.node === n.name)
      })
    }
    if (node.length > 1) val.type = "multi"
    let height = 0,
      width = 0
    if (node.length > 0 && val.type !== "multi") {
      str_height = node[0].tags.find((val) => val.match(/^[0-9]{1,2}u/)) ?? "0"
      height = parseInt(str_height.replace("u", ""))
      width = 1
    } else if (node.length > 0) {
      str_height = node[0].tags.find((val) => val.match(/^[0-9]{1,2}u/)) ?? "0"
      height = parseInt(str_height.replace("u", ""))
      width = node.length
    }

    let latest_bios = ""
    let latest_bmc = ""
    if (redfish_res !== null && redfish_res !== undefined && redfish_res.redfish.status !== "error") {
      let latest_firmwareArr = config.bmc.firmware_versions
      latest_firmwareArr.forEach((val) => {
        if (redfish_res.redfish.model.match(val.model)) {
          latest_bios = val.bios
          latest_bmc = val.bmc
        }
      })

      let node_model = redfish_res.redfish.model
      config.rack.node_size.forEach((size) => {
        size.models.forEach((models) => {
          if (node_model.match(models)) {
            height = size.height
            width = size.width
          }
        })
      })
    }
    return {
      ...val,
      height,
      width,
      latest_bios,
      latest_bmc,
      grendel: node,
      redfish: redfish_res?.redfish,
      notes: redfish_res?.notes,
    }
  })
}

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

function floorplan(grendel_query, switch_query) {
  const floorX = config.floorplan.floorX
  const floorY = config.floorplan.floorY
  let nodes = new Map()
  let switches = new Map()

  // Create maps for easy filtering
  grendel_query.result.forEach((val) => {
    let rack = val.name.substring(4, 7)
    let tmp = typeof nodes.get(rack) === "object" ? nodes.get(rack) : []
    nodes.set(rack, [...tmp, val])
  })
  switch_query.forEach((val) => {
    let rack = val.node.substring(4, 7)
    let tmp = typeof switches.get(rack) === "object" ? switches.get(rack) : []
    switches.set(rack, [...tmp, val])
  })

  // Main floorplan generation
  let floorplan = []
  floorX.forEach((row) => {
    floorY.forEach((col) => {
      let rack = row + col
      let rackArr = nodes.get(rack) ?? []
      let switchArr = switches.get(rack) ?? []
      let nodeCounts = nodeCount(rackArr)
      let switchInfo = swDisplay(switches.get(rack))
      floorplan.push({
        rack: rack,
        // avoid doing client calculations
        // nodes: rackArr,
        // switches: switchArr,
        slurm: compareTags(rackArr),
        node_count: nodeCounts.node_count,
        u_count: nodeCounts.u_count,
        nodes_color: config.floorplan.color_mapping.default_color,
        default_color: config.floorplan.color_mapping.default_color,
        switchInfo,
      })
    })
  })

  return { status: "success", config: config.floorplan, result: floorplan }
}

// Local functions:

// rack information
const nodeCount = (arr) => {
  let node_count = 0
  let u_count = 0

  arr.forEach((val) => {
    let type = val.name.substring(0, 3)
    if (!["pdu"].includes(type)) {
      if (!["swe", "swi"].includes(type)) node_count++
      u_count++
      // check for mult u nodes
      if (val.tags !== null) {
        val.tags.forEach((val) => {
          if (val.match(/^[0-9]{1,2}u/)) {
            u_count += parseInt(val.match(/^[0-9]{1,2}/)) - 1
          }
        })
      }
    }
  })
  return { node_count, u_count }
}
// set rack partitions and colors
const compareTags = (arr) => {
  let output = {
    partition: "",
    color: config.floorplan.color_mapping.secondary_color,
  }
  let tags = new Set()
  if (arr !== undefined && arr.length > 0) {
    arr.forEach((val) => {
      if (val.tags !== null) val.tags.forEach((tag) => tags.add(tag))
    })

    config.floorplan.tag_mapping.forEach((val) => {
      if (tags.has(val.tag) && output.partition === "") {
        output.partition = val.tag
        output.color = val.color
      } else if (tags.has(val.tag) && output.partition !== "") {
        output.partition = config.floorplan.tag_multiple.tag
        output.color = config.floorplan.tag_multiple.color
      }
    })
  }
  return output
}

// switch display info
const swDisplay = (switches) => {
  let output = {
    sw_models: [],
    sw_models_color: config.floorplan.color_mapping.default_color,
    sw_versions: [],
    sw_versions_color: config.floorplan.color_mapping.default_color,
    sw_ratios: [],
    sw_ratios_color: config.floorplan.color_mapping.default_color,
  }
  let tmpModels = []
  let tmpVersions = []
  let tmpRatios = []

  if (switches !== undefined) {
    switches.forEach((val) => {
      tmpModels.push(shortenName(val.system.model))
      tmpVersions.push(shortenVersion(val.system.version))
      tmpRatios.push(val.info.active_oversubscription)
    })
    // model color mapping | based on if a switch model is present in the rack
    let tmpModelColor = config.floorplan.color_mapping.secondary_color
    config.floorplan.color_mapping.model_color.forEach((val) => {
      if (tmpModels.find((x) => x.match(val.model))) tmpModelColor = val.color
    })
    output.sw_models_color = tmpModelColor

    // Version color mapping
    let tmpVersionColor = config.floorplan.color_mapping.secondary_color
    config.floorplan.color_mapping.version_color.forEach((val) => {
      if (tmpVersions.find((x) => x.match(val.version))) tmpVersionColor = val.color
    })
    output.sw_versions_color = tmpVersionColor

    // Count duplicates
    output.sw_models = swDuplicates(tmpModels)
    output.sw_versions = swDuplicates(tmpVersions)
    output.sw_ratios = swDuplicates(tmpRatios)
  }
  return output
}
// Replace duplicates with "(count)name"
const swDuplicates = (duplicates) => {
  let tmp = duplicates.reduce((count, current) => ((count[current] = count[current] + 1 || 1), count), {})
  return Object.keys(tmp)
    .map((val) => {
      let count = tmp[val] > 1 ? `(${tmp[val]})` : ""
      if (val !== "undefined") return `${count}${val}`
      return null
    })
    .filter(Boolean)
}

const shortenName = (name) => {
  if (name.match("^PowerConnect")) return "PC" + name.substring(13)
  else if (name.match("-ON")) return name.replace("-ON", "")
  else return name
}
const shortenVersion = (version) => {
  if (version !== undefined) return version.replace(/ *\([^)]*\) */g, "")
  else return "undefined"
}

module.exports = { rackGen, pduFormat, switchFormat, nodeFormat, quadNodeFormat, floorplan }
