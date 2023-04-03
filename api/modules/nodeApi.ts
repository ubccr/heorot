// TODO: deprecate
import config from "../../config/config.js"
import fetch from "node-fetch"
import https from "https"

const agent = new https.Agent({
  rejectUnauthorized: false,
})

export async function biosApi(node: string) {
  const encoded = Buffer.from(config.settings.bmc.username + ":" + config.settings.bmc.password).toString("base64")
  const auth = "Basic " + encoded
  const header = {
    headers: {
      method: "GET",
      Authorization: auth,
      credentials: "include",
    },
    agent,
  }
  const api_url = "https://" + node + "/redfish/v1/Systems/System.Embedded.1/Bios"

  try {
    const fetch_res = await fetch(api_url, header)
    const json_res: any = await fetch_res.json()
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
      node: api_url,
      error: error,
    }
  }
}
