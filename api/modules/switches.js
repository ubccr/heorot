const { NodeSSH } = require("node-ssh")
const { grendelRequest } = require("../modules/grendel")
const config = require("../config")
const xml2js = require("xml2js")
const SSH2Promise = require("ssh2-promise")

// async function getSwInfo(node, command) {
//   // Grendel
//   const grendelRes = await grendelRequest(`/v1/host/find/${node}`)

//   if (grendelRes.result.length === 0) {
//     return { status: "error", message: "No matching node name found in Grendel" }
//   }
//   if (grendelRes.status !== "success") {
//     return { status: "error", message: grendelRes.result }
//   }
//   let grendel = grendelRes.result[0]
//   const fqdn = grendel.interfaces[0].fqdn !== "" ? grendel.interfaces[0].fqdn : grendel.interfaces[0].ip

//   // Switch version logic
//   let parseType = ""
//   let cmd = command
//   let user = config.switches.user
//   let pass = config.switches.pass

//   if (grendel.tags.includes("Arista_EOS")) {
//     parseType = "EOS"
//     user = config.switches.userEOS !== "" ? config.switches.userEOS : user
//     pass = config.switches.passEOS !== "" ? config.switches.passEOS : pass
//   } else if (grendel.tags.includes("Dell_OS10")) {
//     parseType = "OS10"
//     user = config.switches.userOS10 !== "" ? config.switches.userOS10 : user
//     pass = config.switches.passOS10 !== "" ? config.switches.passOS10 : pass
//     if (command === "show interfaces status") cmd = "show interface status"
//   } else if (grendel.tags.includes("Dell_OS9")) {
//     parseType = "OS9"
//     user = config.switches.userOS9 !== "" ? config.switches.userOS9 : user
//     pass = config.switches.passOS9 !== "" ? config.switches.passOS9 : pass
//     if (command === "show mac address-table") cmd = "show mac-address-table"
//   } else if (grendel.tags.includes("Dell_OS8")) {
//     // parseType = "OS8"
//     // user = config.switches.userOS8 !== "" ? config.switches.userOS8 : user
//     // pass = config.switches.passOS8 !== "" ? config.switches.passOS8 : pass
//     // if (command === "show mac address-table") cmd = "show mac-address-table"
//     return { status: "error", message: "Dell OS8 switches are not supported" }
//   } else
//     return {
//       status: "error",
//       message: `Could not determine ${node}'s OS version, please add the appropriate grendel tag entry`,
//     }

//   // Switch query
//   let conn = new NodeSSH()
//   let output = new Object()
//   let SSHConfig = {
//     host: fqdn,
//     username: user,
//     tryKeyboard: true,
//     password: pass,
//     onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
//       if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes("password")) {
//         finish([pass])
//       }
//     },
//     algorithms: {
//       kex: [
//         "curve25519-sha256",
//         "curve25519-sha256@libssh.org",
//         "ecdh-sha2-nistp256",
//         "ecdh-sha2-nistp384",
//         "ecdh-sha2-nistp521",
//         "diffie-hellman-group-exchange-sha256",
//         "diffie-hellman-group14-sha256",
//         "diffie-hellman-group15-sha512",
//         "diffie-hellman-group16-sha512",
//         "diffie-hellman-group17-sha512",
//         "diffie-hellman-group18-sha512",
//         // older algos for HPE nodes
//         "diffie-hellman-group14-sha1",
//         "diffie-hellman-group1-sha1",
//       ],
//       cipher: [
//         "aes128-ctr",
//         "aes192-ctr",
//         "aes256-ctr",
//         "aes128-gcm",
//         "aes256-gcm",
//         "aes128-cbc",
//         "3des-cbc",
//         "aes256-cbc",
//       ],
//     },
//   }
//   try {
//     await conn.connect(SSHConfig)
//     let data = new Object()

//     data = await conn.execCommand(cmd)

//     if (data.stderr !== "") return { status: "error", message: data.message }

//     output.status = "success"

//     output.data = parseOutput(data.stdout, parseType, command)

//     return output
//   } catch (err) {
//     console.error(err)
//     return {
//       status: "error",
//       message: `Switch SSH connection error on switch ${node}`,
//     }
//   }
// }

// Warning: Risk of nausea ahead - This is all super fragile & a horrible solution
// TODO: find proper method of parsing the stdout, maybe textfsm templates are easier??
// const parseOutput = (data, type, command) => {
//   let sep1 = type === "OS9" ? "\r\n" : "\n"
//   let sep2 = type === "EOS" ? "  " : "\t"

//   if (command === "show version") {
//     return data.split(sep1).map((val) => val.split(": ").filter(String))
//   } else if (command === "show mac address-table") {
//     let tmp = data.split(sep1).map((val) => val.split(sep2).filter(String))

//     let portMapping = tmp
//       .map((val, index) => {
//         if (val.length > 2 && !["VlanId", "Vlan", "----"].includes(val[0])) {
//           let iface = ""
//           if (val[3].includes("ethernet")) iface = val[3].substring(12)
//           else if (val[3].includes("Te")) iface = val[3].substring(5)
//           else iface = val[3]

//           return {
//             vlan: val[0].trim(),
//             mac: val[1].trim(),
//             type: val[2].trim(),
//             interface: iface.trim(),
//           }
//         }
//       })
//       .filter(Boolean)

//     return portMapping
//   } else if (command === "show interfaces status") {
//     let tmp = data.split(sep1).map((val) => val.split("  ").filter(String))
//     let portMapping = tmp
//       .map((val, index) => {
//         if (val[0] !== "Port" && val.length >= 5) {
//           if (val[1].includes("Up") || val[1].includes("Down")) val.splice(1, 0, "") // OS9
//           if (
//             val[1].includes("connect") ||
//             (val[1].includes("up") && !val[1].includes("puppet")) ||
//             val[1].includes("down")
//           )
//             val.splice(1, 0, "")

//           if (type === "OS9") {
//             if (val[2].includes("Up")) val[2] = "up"
//             else if (val[2].includes("Down")) val[2] = "down"

//             if (val[3].includes("100 Mbit")) val[3] = "100M"
//             else if (val[3].includes("1000 Mbit")) val[3] = "1G"
//             else if (val[3].includes("10000 Mbit")) val[3] = "10G"
//             else if (val[3].includes("40000 Mbit")) val[3] = "40G"

//             return {
//               port: val[0].substring(5),
//               description: val[1],
//               status: val[2].trim(),
//               duplex: "",
//               speed: val[3],
//               mode: val[4].trim(),
//               vlans: val[5],
//             }
//           } else if (type === "OS10") {
//             if (val[3].includes("1000M")) val[3] = "1G"
//             return {
//               port: val[0].substring(8),
//               description: val[1],
//               status: val[2].trim(),
//               duplex: val[4],
//               speed: val[3].trim(),
//               mode: val[5].trim(),
//               vlans: val[6] ?? "",
//             }
//           } else if (type === "EOS" && val[0].length > 5) {
//             if (val[6] === " ") val.splice(4, 0, "")
//             if (val[2].includes("connected")) val[2] = "up"
//             else if (val[2].includes("notconnect")) val[2] = "down"

//             return {
//               port: val[0].substring(2),
//               description: val[1],
//               status: val[2],
//               vlans: val[3].trim(),
//               duplex: val[4],
//               speed: val[5].trim(),
//               type: val[6].trim(),
//             }
//           }

//           // return { port: val[0], status: val[1], speed: val[2], mode: val[3], vlans: val[4] }
//         }
//       })
//       .filter(Boolean)

//     return portMapping
//   } else if (command === "show module") {
//     return data.split(sep1).map((val) => val.split("  ").filter(String))
//   } else {
//     return data
//   }
// }

const getSwInfoV2 = async (node) => {
  // Grendel
  const grendelRes = await grendelRequest(`/v1/host/find/${node}`)

  if (grendelRes.result.length === 0) {
    return { status: "error", message: "No matching node name found in Grendel" }
  }
  if (grendelRes.status !== "success") {
    return { status: "error", message: grendelRes.result }
  }
  let grendel = grendelRes.result[0]
  const fqdn = grendel.interfaces[0].fqdn !== "" ? grendel.interfaces[0].fqdn : grendel.interfaces[0].ip

  // Switch version logic
  let parseType = ""
  let user = config.switches.user
  let pass = config.switches.pass

  let commands = ["show version", "show interfaces status", "show mac address-table"]

  if (grendel.tags.includes("Arista_EOS")) {
    parseType = "EOS"
    user = config.switches.userEOS !== "" ? config.switches.userEOS : user
    pass = config.switches.passEOS !== "" ? config.switches.passEOS : pass
    commands = ["show version | json", "show interfaces status | json", "show mac address-table | json"]
  } else if (grendel.tags.includes("Dell_OS10")) {
    commands = [
      "show inventory | display-xml",
      "show interface status | display-xml",
      "show mac address-table | display-xml",
    ]
    parseType = "OS10"
    user = config.switches.userOS10 !== "" ? config.switches.userOS10 : user
    pass = config.switches.passOS10 !== "" ? config.switches.passOS10 : pass
  } else if (grendel.tags.includes("Dell_OS9")) {
    // old query
    commands = ["show inventory", "show interface status | no-more", "show mac-address-table | no-more"]
    parseType = "OS9"
    user = config.switches.userOS9 !== "" ? config.switches.userOS9 : user
    pass = config.switches.passOS9 !== "" ? config.switches.passOS9 : pass
    return oldSwInfo(commands, fqdn, user, pass)
  } else if (grendel.tags.includes("Dell_OS8")) {
    // old query
    commands = ["show system", "show interfaces status", "enable", "show bridge address-table"]
    parseType = "OS8"
    user = config.switches.userOS8 !== "" ? config.switches.userOS8 : user
    pass = config.switches.passOS8 !== "" ? config.switches.passOS8 : pass
    return oldSwInfo(commands, fqdn, user, pass)
    // return { status: "error", message: "Dell OS8 switches are not supported" }
  } else
    return {
      status: "error",
      message: `Could not determine ${node}'s OS version, please add the appropriate grendel tag entry`,
    }

  // Switch query
  let conn = new NodeSSH()
  let SSHConfig = {
    host: fqdn,
    username: user,
    tryKeyboard: true,
    password: pass,
    onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
      if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes("password")) {
        finish([pass])
      }
    },
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
      cipher: [
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "aes128-gcm",
        "aes256-gcm",
        "aes128-cbc",
        "3des-cbc",
        "aes256-cbc",
      ],
    },
  }
  try {
    await conn.connect(SSHConfig)

    let data = commands.map(async (cmd) => {
      return await conn.execCommand(cmd)
    })
    let raw = await Promise.all(data)
    let parsed = raw.map(async (val) => {
      // TODO: better error handling
      let tmp = {}
      if (val.code === 0) tmp = await parseOutputV2(val.stdout, parseType)
      else console.error(val.stderr)
      return {
        ...tmp,
      }
    })
    let output = await Promise.all(parsed)
    return { status: "success", result: output }
    // return output
  } catch (err) {
    console.error(err)
    return {
      status: "error",
      message: `Switch SSH connection error on switch ${node}`,
    }
  }
}

const parseOutputV2 = async (data, type) => {
  if (type === "EOS") {
    let tmp = JSON.parse(data)
    let output = {}
    let cmd = ""
    if (tmp.hasOwnProperty("modelName")) {
      // EOS show inventory
      cmd = "show version"
      output = {
        model: tmp.modelName,
        uptime: tmp.uptime,
        version: tmp.version,
        vendor: tmp.mfgName,
        serviceTag: tmp.serialNumber,
      }
    } else if (tmp.hasOwnProperty("interfaceStatuses")) {
      // EOS show interfaces status
      cmd = "show interface status"
      let tmpArr = Object.entries(tmp.interfaceStatuses)
      output = tmpArr
        .map((val) => {
          let status = val[1].linkStatus === "notconnect" ? "Down" : "Up"
          let duplex = val[1].duplex === "duplexFull" ? "Full" : val[1].duplex

          if (val[0].match("^Ethernet"))
            return {
              port: val[0].substring(8),
              vlan: val[1].vlanInformation.vlanId ?? val[1].vlanInformation.vlanExplanation,
              speed: `${val[1].bandwidth / 1000000000}G`,
              type: val[1].interfaceType,
              description: val[1].description,
              duplex: duplex,
              status: status.toLowerCase(),
            }
        })
        .filter(Boolean)
      output.sort(
        (a, b) =>
          a.port.split("/")[0] - b.port.split("/")[0] ||
          a.port.split("/")[1] - b.port.split("/")[1] ||
          a.port.split("/")[2] - b.port.split("/")[2]
      )
    } else if (tmp.hasOwnProperty("unicastTable")) {
      // EOS show mac address-table
      cmd = "show mac address-table"
      output = tmp.unicastTable.tableEntries
        .map((val) => {
          let port = val.interface.match("^Ethernet") ? val.interface.substring(8) : val.interface

          return {
            port: port,
            mac: val.macAddress,
            type: val.entryType,
            vlan: val.vlanId,
          }
        })
        .filter(Boolean)
    }

    return { command: cmd, output }
  } else if (type === "OS10") {
    try {
      let convertTmp = await xml2js.parseStringPromise(data)
      let tmp = {}

      if (convertTmp["rpc-reply"].hasOwnProperty("bulk")) tmp = convertTmp["rpc-reply"].bulk[0].data[0]
      else tmp = convertTmp["rpc-reply"].data[0]

      if (tmp.hasOwnProperty("system")) {
        // OS10 show system
        let node = tmp.system[0].node[0]
        return {
          command: "show inventory",
          output: {
            model: node["mfg-info"][0]["product-name"][0],
            version: node.unit[0]["software-version"][0],
            serviceTag: node["mfg-info"][0]["service-tag"][0],
            vendor: node["mfg-info"][0]["vendor-name"][0],
            ports: node.unit[0]["port-info"][0],
          },
        }
      } else if (tmp.hasOwnProperty("interfaces-state")) {
        // OS10 show interfaces status
        let ifaces = tmp["interfaces-state"][1].interface.map((val) => {
          let speed = ""
          if (val.speed[0] === "100000000") speed = "100M"
          else if (val.speed[0] >= "1000000000") speed = `${val.speed[0] / 1000000000}G`
          let vlans = []
          if (val["untagged-vlan"] !== undefined) vlans.push(val["untagged-vlan"][0])
          if (val["tagged-vlans"] !== undefined) vlans.push(val["tagged-vlans"][0])

          return {
            port: val.name[0].substring(12),
            status: val["oper-status"][0],
            speed: speed,
            duplex: val.duplex[0],
            mode: val.mode[0],
            vlan: vlans.join(", "),
            description: val.description !== undefined ? val.description[0] : "",
          }
        })
        return { command: "show interface status", output: ifaces }
      } else if (tmp.hasOwnProperty("fwd-table")) {
        // OS10 show mac address-table
        let table = tmp["fwd-table"].map((val) => {
          return {
            port: val["if-name"][0].match("^ethernet") ? val["if-name"][0].substring(12) : val["if-name"][0],
            mac: val["mac-addr"][0],
            vlan: val.vlan[0],
            type: val["entry-type"][0],
            status: val.status[0],
          }
        })
        return { command: "show mac address-table", output: table }
      }
    } catch (err) {
      console.error(err)
    }
  }
}

const oldSwInfo = async (commands, fqdn, user, pass) => {
  const output = await new Promise((resolve, reject) => {
    let host = {
      server: {
        host: fqdn,
        userName: user,
        password: pass,
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
          cipher: [
            "aes128-ctr",
            "aes192-ctr",
            "aes256-ctr",
            "aes128-gcm",
            "aes256-gcm",
            "aes128-cbc",
            "3des-cbc",
            "aes256-cbc",
          ],
        },
      },
      asciiFilter: "[^\t\r\n\x20-\x7e]",
      tryKeyboard: false,
      idleTimeOut: 25000,
      commands: commands,
    }

    const SSH2Shell = require("ssh2shell")
    let SSH = new SSH2Shell(host)

    let responseArr = []

    SSH.on("commandProcessing", (command, response, sshObj, stream) => {
      if (response.indexOf("(y/n)") != -1 && sshObj.firstRun !== true) {
        sshObj.firstRun = true
        stream.write("y")
      } else if (response.indexOf("--More--") != -1) {
        stream.write("\n")
      }
    })

    SSH.on("commandComplete", (command, response, sshObj, stream) => {
      let output = parseOldOutput(response, command)
      if (output !== null) responseArr.push({ command: command, output }) // get rid of null from "enable" command
    })
    callback = (response) => {
      resolve(responseArr)
    }

    SSH.connect(callback)
  })
  return {
    status: "success",
    result: output,
  }
}

const parseOldOutput = (data, command) => {
  if (command.includes("inventory")) {
    // OS9 show inventory
    let tmp = data.split("\r\n").map((val) => val.split(": "))
    let stIndex = 0
    tmp.forEach((e) =>
      e.forEach((val) => {
        if (val.match("Svc Tag")) {
          stIndex = val.match("Svc Tag").index
        }
      })
    )
    let ST = ""
    if (stIndex > 0) {
      let tmpST = tmp.map((e) => e.map((val) => val.substring(stIndex)).filter(String)).filter(String)
      tmpST.forEach((e) =>
        e.forEach((val) => {
          if (val.match("[0-9A-Z]{5,7}")) ST = val.match("[0-9A-Z]{5,7}")[0]
        })
      )
    }
    // return tmp
    return {
      model: tmp.find((e) => e.find((val) => val.includes("System Type")))[1].trim(),
      version: tmp.find((e) => e.find((val) => val.includes("Software Version")))[1],
      serviceTag: ST,
    }
  } else if (command.includes("system")) {
    // OS8 show system
    let tmp = data.split("\r\n").map((val) => val.split(": "))
    return {
      model: notNull(
        tmp.find((val) => val[0].includes("Machine Type")),
        1
      ),
      name: notNull(
        tmp.find((val) => val[0].includes("System Name")),
        1
      ),
      uptime: notNull(
        tmp.find((val) => val[0].includes("Up Time")),
        1
      ),
    }
  } else if (command.includes("bridge")) {
    // OS8 show bridge address-table
    let tmp = data.split("\r\n")
    let macAddressTable = tmp
      .map((val) => {
        if (val.match("1/[a-z]{1,2}[0-9]{1,2}")) {
          let tmpPort = val.match("1/[a-z]{1,2}[0-9]{1,2}")[0].substring(2)
          let port = ""
          if (tmpPort.substring(0, 1) === "g") port = tmpPort.substring(1)
          else if (tmpPort.substring(0, 2) === "xg") port = parseInt(tmpPort.substring(2)) + 48 // might need to change
          else port = tmpPort
          return {
            port: port,
            mac: val
              .match("[0-9A-Z]{4}.[0-9A-Z]{4}.[0-9A-Z]{4}")[0]
              .replace(/\./g, "")
              .replace(/.{2}\B/g, "$&:"),
          }
        }
      })
      .filter(Boolean)
    // return tmp
    return macAddressTable
  } else if (command.includes("interfaces")) {
    // OS8 show interfaces status
    let tmp = data.split("\r\n")
    let mapping = tmp
      .map((val) => {
        if (val.match("1/[a-z]{1,2}[0-9]{1,2}")) {
          let tmpPort = notNull(val.match("1/[a-z]{1,2}[0-9]{1,2}")).substring(2)
          let port = ""
          if (tmpPort.substring(0, 1) === "g") port = tmpPort.substring(1)
          else if (tmpPort.substring(0, 2) === "xg") port = parseInt(tmpPort.substring(2)) + 48 // might need to change
          else port = tmpPort

          let tmpSpeed = notNull(val.match("[0-9]{3,5}"))
          let speed = ""
          if (tmpSpeed === "10000") speed = "10G"
          else if (tmpSpeed === "1000") speed = "1G"
          else if (tmpSpeed === "100") speed = "100M"
          return {
            port: port,
            status: notNull(val.match("(Up|Down)")).toLowerCase(),
            speed: speed,
            duplex: notNull(val.match("(Full|N/A)")),
          }
        }
      })
      .filter(Boolean)
    return mapping
  } else if (command.includes("interface status")) {
    // OS9 show interface status
    let tmp = data.split("\r\n")
    let spacing = {}
    let mapping = tmp
      .map((val) => {
        if (val.match("^(Port)")) {
          spacing.port = val.match("(Port)").index
          spacing.description = val.match("(Description)").index
          spacing.status = val.match("(Status)").index
          spacing.speed = val.match("(Speed)").index
          spacing.duplex = val.match("(Duplex)").index
          spacing.vlan = val.match("(Vlan)").index
        }
        if (val.match("[0-1]/[0-9]{1,2}")) {
          let tmpSpeed = val.substring(spacing.speed, spacing.duplex).trim()
          let speed = ""

          if (tmpSpeed === "100000 Mbit") speed = "100G"
          else if (tmpSpeed === "40000 Mbit") speed = "40G"
          else if (tmpSpeed === "10000 Mbit") speed = "10G"
          else if (tmpSpeed === "1000 Mbit") speed = "1G"
          else if (tmpSpeed === "100 Mbit") speed = "100M"
          return {
            port: val.substring(spacing.port, spacing.description).trim().substring(5),
            description: val.substring(spacing.description, spacing.status).trim(),
            status: val.substring(spacing.status, spacing.speed).trim().toLowerCase(),
            speed: speed,
            duplex: val.substring(spacing.duplex, spacing.vlan).trim(),
            vlan: val.substring(spacing.vlan).trim(),
          }
        }
      })
      .filter(Boolean)
    return mapping
  } else if (command.includes("mac-address-table")) {
    // OS9 show mac-address-table
    let tmp = data.split("\r\n").map((val) => val.split("\t"))
    let mapping = tmp
      .map((val) => {
        if (val.length > 1) {
          return {
            port: val[3].match("^Te") ? val[3].trim().substring(5) : val[3].trim(),
            mac: val[1].trim(),
            type: val[2].trim(),
            vlanId: val[0].trim(),
            state: val[4].trim(),
          }
        }
      })
      .filter(Boolean)
    // return tmp
    return mapping
  } else if (command.includes("enable")) {
    return null
  } else return data.split("\r\n").map((val) => val.split("\t"))
}

const notNull = (data, pos = 0) => {
  // ensure return of data incase of error
  if (data !== undefined && data !== null && data[pos] !== undefined) return data[pos]
  else return null
}

module.exports = { getSwInfoV2 }
