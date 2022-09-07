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
  let user = config.switches.user
  let pass = config.switches.pass

  if (grendel.tags.includes("Arista_EOS")) {
    parseType = "EOS"
    user = config.switches.userEOS !== "" ? config.switches.userEOS : user
    pass = config.switches.passEOS !== "" ? config.switches.passEOS : pass
  } else if (grendel.tags.includes("Dell_OS10")) {
    parseType = "OS10"
    user = config.switches.userOS10 !== "" ? config.switches.userOS10 : user
    pass = config.switches.passOS10 !== "" ? config.switches.passOS10 : pass
    if (command === "show interfaces status") cmd = "show interface status"
  } else if (grendel.tags.includes("Dell_OS9")) {
    parseType = "OS9"
    user = config.switches.userOS9 !== "" ? config.switches.userOS9 : user
    pass = config.switches.passOS9 !== "" ? config.switches.passOS9 : pass
    if (command === "show mac address-table") cmd = "show mac-address-table"
  } else if (grendel.tags.includes("Dell_OS8")) {
    // parseType = "OS8"
    // user = config.switches.userOS8 !== "" ? config.switches.userOS8 : user
    // pass = config.switches.passOS8 !== "" ? config.switches.passOS8 : pass
    // if (command === "show mac address-table") cmd = "show mac-address-table"
    return { status: "error", message: "Dell OS8 switches are not supported" }
  } else
    return {
      status: "error",
      message: `Could not determine ${node}'s OS version, please add the appropriate grendel tag entry`,
    }

  // Switch query
  let conn = new NodeSSH()
  let output = new Object()
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
    let data = new Object()

    data = await conn.execCommand(cmd)

    if (data.stderr !== "") return { status: "error", message: data.message }

    output.status = "success"

    output.data = parseOutput(data.stdout, parseType, command)

    return output
  } catch (err) {
    console.error(err)
    return {
      status: "error",
      message: `Switch SSH connection error on switch ${node}`,
    }
  }
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
          if (val[1].includes("Up") || val[1].includes("Down")) val.splice(1, 0, "") // OS9
          if (
            val[1].includes("connect") ||
            (val[1].includes("up") && !val[1].includes("puppet")) ||
            val[1].includes("down")
          )
            val.splice(1, 0, "")

          if (type === "OS9") {
            if (val[2].includes("Up")) val[2] = "up"
            else if (val[2].includes("Down")) val[2] = "down"

            if (val[3].includes("100 Mbit")) val[3] = "100M"
            else if (val[3].includes("1000 Mbit")) val[3] = "1G"
            else if (val[3].includes("10000 Mbit")) val[3] = "10G"
            else if (val[3].includes("40000 Mbit")) val[3] = "40G"

            return {
              port: val[0].substring(5),
              description: val[1],
              status: val[2].trim(),
              duplex: "",
              speed: val[3],
              mode: val[4].trim(),
              vlans: val[5],
            }
          } else if (type === "OS10") {
            if (val[3].includes("1000M")) val[3] = "1G"
            return {
              port: val[0].substring(8),
              description: val[1],
              status: val[2].trim(),
              duplex: val[4],
              speed: val[3].trim(),
              mode: val[5].trim(),
              vlans: val[6],
            }
          } else if (type === "EOS" && val[0].length > 5) {
            if (val[6] === " ") val.splice(4, 0, "")
            if (val[2].includes("connected")) val[2] = "up"
            else if (val[2].includes("notconnect")) val[2] = "down"

            return {
              port: val[0].substring(2),
              description: val[1],
              status: val[2],
              vlan: val[3],
              duplex: val[4],
              speed: val[5].trim(),
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
