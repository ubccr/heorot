const { NodeSSH } = require("node-ssh")
const { grendelRequest } = require("../modules/grendel")
const config = require("../config")

async function getSwInfo(node, command) {
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
  let cmd = command

  if (grendel.tags.includes("Arista_EOS")) {
    parseType = "EOS"
  } else if (grendel.tags.includes("Dell_OS10")) {
    parseType = "OS10"
    if (command === "show interfaces status") cmd = "show interface status"
  } else if (grendel.tags.includes("Dell_OS9")) {
    parseType = "OS9"
    if (command === "show mac address-table") cmd = "show mac-address-table"
  } else if (grendel.tags.includes("Dell_OS8")) {
    parseType = "OS8"
    // TODO: add OS8 support
    return { status: "error", message: "Dell OS8 queries not supported" }
  } else
    return {
      status: "error",
      message: "Could not determine switch OS version, please add the appropriate grendel tag entry",
    }

  // Switch query
  let conn = new NodeSSH()
  let output = new Object()
  let SSHConfig = {
    host: fqdn,
    username: config.netpalm.swUser,
    tryKeyboard: true,
    password: config.netpalm.swPass,
    onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
      if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes("password")) {
        finish([config.netpalm.swPass])
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
    },
  }

  await conn.connect(SSHConfig)

  let data = await conn.execCommand(cmd)
  if (data.stderr !== "") return { status: "error", message: data.message }

  output.status = "success"

  output.data = parseOutput(data.stdout, parseType, command)

  return output
}

// Warning: Risk of nausea ahead - This is all super fragile & a horrible solution
// TODO: find proper method of parsing the stdout, maybe textfsm templates are easier??
const parseOutput = (data, type, command) => {
  let sep1 = type === "OS9" ? "\r\n" : "\n"
  let sep2 = type === "EOS" ? "  " : "\t"

  if (command === "show version") {
    return data.split(sep1).map((val) => val.split(": ").filter(String))
  } else if (command === "show mac address-table") {
    let tmp = data.split(sep1).map((val) => val.split(sep2).filter(String))

    let portMapping = tmp
      .map((val, index) => {
        if (val.length > 2 && !["VlanId", "Vlan", "----"].includes(val[0])) {
          let iface = ""
          if (val[3].includes("ethernet")) iface = val[3].substring(12)
          else if (val[3].includes("Te")) iface = val[3].substring(5)
          else iface = val[3]

          return {
            vlan: val[0],
            mac: val[1],
            type: val[2],
            interface: iface,
          }
        }
      })
      .filter(Boolean)

    return portMapping
  } else if (command === "show interfaces status") {
    let tmp = data.split(sep1).map((val) => val.split("  ").filter(String))
    let portMapping = tmp
      .map((val, index) => {
        if (val[0] !== "Port" && val.length >= 5) {
          let port = ""
          if (val[1].includes("Up") || val[1].includes("Down")) val.splice(1, 0, "") // OS9
          if (val[1].includes("connect") || val[1].includes("up") || val[1].includes("down")) val.splice(1, 0, "")

          if (type === "OS9") {
            if (val[2].includes("Up")) val[2] = "up"
            else if (val[2].includes("Down")) val[2] = "down"
            return {
              port: val[0].substring(5),
              description: val[1],
              status: val[2],
              duplex: "",
              speed: val[3],
              mode: val[4],
              vlans: val[5],
            }
          } else if (type === "OS10") {
            return {
              port: val[0].substring(8),
              description: val[1],
              status: val[2],
              duplex: val[3],
              speed: val[4],
              mode: val[5],
              vlans: val[6],
            }
          } else if (type === "EOS" && val[0].length > 5) {
            if (val[2].includes("connected")) val[2] = "up"
            else if (val[2].includes("notconnect")) val[2] = "down"

            return {
              port: val[0],
              description: val[1],
              status: val[2],
              vlan: val[3],
              duplex: val[4],
              speed: val[5],
              type: val[6],
            }
          }

          // return { port: val[0], status: val[1], speed: val[2], mode: val[3], vlans: val[4] }
        }
      })
      .filter(Boolean)

    return portMapping
  } else if (command === "show module") {
    return data.split(sep1).map((val) => val.split("  ").filter(String))
  } else {
    return data
  }
}

module.exports = { getSwInfo }
