import fetch, { RequestInit } from "node-fetch"
import redfish_auth, { Auth, redfish_logout } from "./redfish/auth"

import { Agent } from "https"
import dell_redfish from "./redfish/dell2"

const { getBMC } = require("./grendel")

const agent = new Agent({
  rejectUnauthorized: false,
})

export interface apiResponse<T> {
  success: boolean
  resource?: string
  info?: {
    message: string
    code?: number
    error: any
  }
  data?: T
}
export async function api_request(
  url: string,
  auth: Auth,
  method = "GET",
  req_json = true,
  body = undefined
): Promise<apiResponse<any>> {
  let output: apiResponse<any> = { success: false }
  try {
    if (auth.token === undefined) throw "Auth token cannot be undefined"
    let headers: HeadersInit = {
      "X-Auth-Token": auth.token,
      "Content-Type": "application/json",
    }
    let options: RequestInit = {
      method,
      headers,
      body,
      agent,
    }

    let res = await fetch(auth.uri + url, options)
    let json = await res.json()

    if (!res.ok || res.status !== 200) return redfish_error_handler(json, auth)
    if (req_json === true) output = { success: true, data: json }
    else output = { success: true, data: res }
    return output
  } catch (error: any) {
    return { success: false, info: { message: "API request failed!", error } }
  }
}

export const redfishRequest = async (node: string) => {
  let bmc = await getBMC(node)
  if (bmc.status !== "success") return bmc

  let url = `https://${bmc.address}`

  let auth = await redfish_auth(url) // authenticate to BMC and collect info
  if (auth.status !== "success") return auth

  let output = await dell_redfish(auth)

  let res_logout = await redfish_logout(url, auth)
  if (res_logout.status === "error") console.error(`Failed to logout of ${node}`, res_logout)

  return output
}

function redfish_error_handler(data: any, auth: Auth) {
  console.log(data)
  if (auth.oem === "Dell")
    return {
      success: false,
      info: {
        message: data.error["@Message.ExtendedInfo"][0].Message,
        error: data.error["@Message.ExtendedInfo"],
      },
    }
  else return { success: false, info: { message: "Redfish API call failed!", error: data.error } }
}
