import config from "../../config/config.js"
import { fetch_node } from "./nodes.js"

export async function rackGen(grendel: any, rackArr: any, refetch: string) {
  // find all nodes with matching rack name and send redfish requests
  let node_prefix = config.settings.rack.prefix.find((val: any) => val.type === "node")?.prefix ?? []
  if (node_prefix.length === 0) console.error("Could not map array: 'config.settings.rack.prefix' to a type of node")

  let nodes_arr = grendel.result.filter((val: any) => node_prefix.includes(val.name.split("-")[0]))
  let redfish_arr = await Promise.all(nodes_arr.map((val: any) => fetch_node(val.name, refetch)))

  // loop through arr generated in routes/client.js
  return rackArr.map((val: any) => {
    // get all nodes matching the same u that are not pdus
    let pdu_prefix = config.settings?.rack.prefix.find((val: any) => val.type === "pdu")?.prefix ?? []
    if (node_prefix.length === 0) console.error("Could not map array: 'config.settings.rack.prefix' to a type of pdu")

    let node = grendel.result.filter(
      (n: any) => parseInt(n.name.split("-")[2]) === val.u && !pdu_prefix.includes(n.name.split("-")[0])
    )
    // interface Inode_output {
    //   grendel: ,
    //   latest_bios: string,
    //   latest_bmc: string,
    //   redfish: ,
    //   notes: ,
    // }
    let node_output: any[] = []

    if (node !== undefined) {
      // loop through nodes
      node.forEach((n: any, index: number) => {
        let nodeset = n.name.split("-")

        // set type from config file
        config.settings.rack.prefix.forEach((p: any) => {
          val.type = p.prefix.includes(nodeset[0]) ? p.type : val.type
        })
        // get redfish query based on node name
        let redfish_output = redfish_arr.find((val: any) => val.node === n.name)

        // get latest firmware versions
        let latest_bios = ""
        let latest_bmc = ""
        config.settings.bmc?.firmware_versions.forEach((val: any) => {
          if (redfish_output?.redfish.model?.match(val.model)) {
            latest_bios = val.bios
            latest_bmc = val.bmc
          }
        })

        node_output[index] = {
          grendel: n,
          latest_bios,
          latest_bmc,
          redfish: redfish_output?.redfish,
          notes: redfish_output?.notes,
        }
      })
    }

    let height = 0,
      width = 0

    if (node.length > 0) {
      // try to calculate height and width from model name
      if (node_output[0].redfish !== undefined) {
        let node_model = node_output[0].redfish.model ?? ""
        config.settings.rack?.node_size.forEach((size: any) => {
          size.models.forEach((models: any) => {
            if (node_model.match(models)) {
              height = size.height
              width = size.width
            }
          })
        })
      }
      // fallback function to use grendel tags for height
      if (height === 0 || width === 0) {
        let default_width = node[0].name.split("-").length === 4 ? "2" : "1"
        let str_height = node[0].tags.find((val: any) => val.match(/^[0-9]{1,2}u/)) ?? "1"

        let str_width = node[0].tags.find((val: any) => val.match(/^[0-9]{1,2}w/)) ?? default_width

        height = parseInt(str_height.replace("u", "")) ?? 1
        width = parseInt(str_width.replace("w", "")) ?? 1
      }
    }

    return {
      ...val,
      height,
      width,
      nodes: node_output,
    }
  })
}

export function floorplan(grendel_query: any, switch_query: any) {
  const floorX = config.settings.floorplan.floorX
  const floorY = config.settings.floorplan.floorY
  let nodes = new Map()
  let switches = new Map()

  // Create maps for easy filtering
  grendel_query.result.forEach((val: any) => {
    let rack = val.name.substring(4, 7)
    let tmp = typeof nodes.get(rack) === "object" ? nodes.get(rack) : []
    nodes.set(rack, [...tmp, val])
  })
  switch_query.forEach((val: any) => {
    let rack = val.node.substring(4, 7)
    let tmp = typeof switches.get(rack) === "object" ? switches.get(rack) : []
    switches.set(rack, [...tmp, val])
  })

  // Main floorplan generation
  let floorplan: any[] = []
  floorX.forEach((row: any) => {
    floorY.forEach((col: any) => {
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
        nodes_color: config.settings.floorplan.default_color,
        default_color: config.settings.floorplan.default_color,
        switchInfo,
      })
    })
  })

  return { status: "success", config: config.settings.floorplan, result: floorplan }
}

// Local functions:

// rack information
const nodeCount = (arr: any) => {
  let node_count = 0
  let u_count = 0

  arr.forEach((val: any) => {
    let type = val.name.substring(0, 3)
    if (!["pdu"].includes(type)) {
      if (!["swe", "swi"].includes(type)) node_count++
      u_count++
      // check for mult u nodes
      if (val.tags !== null) {
        val.tags.forEach((val: any) => {
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
const compareTags = (arr: any) => {
  let output = {
    partition: "",
    color: config.settings.floorplan.secondary_color,
  }
  let tags = new Set()
  if (arr !== undefined && arr.length > 0) {
    arr.forEach((val: any) => {
      if (val.tags !== null) val.tags.forEach((tag: any) => tags.add(tag))
    })

    config.settings.floorplan.tag_mapping.forEach((val: any) => {
      if (tags.has(val.tag) && output.partition === "") {
        output.partition = val.tag
        output.color = val.color
      } else if (tags.has(val.tag) && output.partition !== "") {
        output.partition = config.settings.floorplan.tag_multiple.tag
        output.color = config.settings.floorplan.tag_multiple.color
      }
    })
  }
  return output
}

// switch display info
const swDisplay = (switches: any) => {
  let output = {
    sw_models: new Array(),
    sw_models_color: config.settings.floorplan.default_color,
    sw_versions: new Array(),
    sw_versions_color: config.settings.floorplan.default_color,
    sw_ratios: new Array(),
    sw_ratios_color: config.settings.floorplan.default_color,
  }
  let tmpModels: any[] = []
  let tmpVersions: any[] = []
  let tmpRatios: any[] = []

  if (switches !== undefined) {
    switches.forEach((val: any) => {
      tmpModels.push(shortenName(val.system.model))
      tmpVersions.push(shortenVersion(val.system.version))
      tmpRatios.push(val.info.active_oversubscription)
    })
    // model color mapping | based on if a switch model is present in the rack
    let tmpModelColor = config.settings.floorplan.secondary_color
    config.settings.floorplan.model_color.forEach((val: any) => {
      if (tmpModels.find((x: any) => x.match(val.model))) tmpModelColor = val.color
    })
    output.sw_models_color = tmpModelColor

    // Version color mapping
    let tmpVersionColor = config.settings.floorplan.secondary_color
    config.settings.floorplan.version_color.forEach((val: any) => {
      if (tmpVersions.find((x: any) => x.match(val.version))) tmpVersionColor = val.color
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
const swDuplicates = (duplicates: any) => {
  let tmp = duplicates.reduce((count: any, current: any) => ((count[current] = count[current] + 1 || 1), count), {})
  return Object.keys(tmp)
    .map((val: any) => {
      let count = tmp[val] > 1 ? `(${tmp[val]})` : ""
      if (val !== "undefined") return `${count}${val}`
      return null
    })
    .filter(Boolean)
}

const shortenName = (name: string) => {
  if (name !== null || name !== undefined) {
    if (name.match("^PowerConnect")) return "PC" + name.substring(13)
    else if (name.match("-ON")) return name.replace("-ON", "")
    else return name
  } else return "undefined"
}
const shortenVersion = (version: string) => {
  if (version !== null || version !== undefined) return version.replace(/ *\([^)]*\) */g, "")
  else return "undefined"
}
