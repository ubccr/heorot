const fetch = require("node-fetch")
const https = require("https")

let config = require("../config")

const agent = new https.Agent({
  rejectUnauthorized: false,
})
const encoded = Buffer.from(config.bmc.DELL_USER + ":" + config.bmc.DELL_PASS).toString("base64")
const auth = "Basic " + encoded
const header = {
  headers: {
    method: "GET",
    Authorization: auth,
    credentials: "include",
  },
  agent,
}

async function biosApi(node) {
  const api_url = "https://" + node + "/redfish/v1/Systems/System.Embedded.1/Bios"

  try {
    fetch_res = await fetch(api_url, header)
    const json_res = await fetch_res.json()
    if (json_res.Id === "Bios") {
      return {
        message: "success",
        Model: json_res.Attributes.SystemModelName,
        BiosVersion: json_res.Attributes.SystemBiosVersion,
        ServiceTag: json_res.Attributes.SystemServiceTag,
        MemorySize: json_res.Attributes.SysMemSize,
        CPU1: json_res.Attributes.Proc1Brand,
        CPU2: json_res.Attributes.Proc2Brand,
        BootOrder: json_res.Attributes.SetBootOrderEn,
      }
    } else {
      return {
        status: "error",
        message: "BIOS API error",
        error: json_res.error["@Message.ExtendedInfo"][0].Message,
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: "BIOS API error",
      error: error.message,
    }
  }
}

module.exports = {
  biosApi,
}
