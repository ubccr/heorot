import config from "../../config/config.js"
import got from "got"
import { host } from "../types/grendel.js"

// let config = require("../../config/config")

export interface grendelRequest<T> {
  status: string
  result?: T
  message?: string
  code?: string
}

export async function grendelRequest(path: string, method = "GET", body = {}): Promise<grendelRequest<any>> {
  try {
    if (method === "GET") {
      let response = await got(`unix:${config.grendel.socket}:${path}`)
      return {
        status: "success",
        result: JSON.parse(response.body),
        message: JSON.stringify(JSON.parse(response.body)),
      }
    } else if (method === "PUT") {
      let response = await got.put(`unix:${config.grendel.socket}:${path}`)
      return {
        status: "success",
        result: JSON.parse(response.body),
        message: JSON.stringify(JSON.parse(response.body)),
      }
    } else if (method === "POST") {
      let response = await got.post(`unix:${config.grendel.socket}:${path}`, {
        json: body,
      })
      return {
        status: "success",
        result: JSON.parse(response.body),
        message: JSON.stringify(JSON.parse(response.body)),
      }
    } else if (method === "DELETE") {
      let response = await got.delete(`unix:${config.grendel.socket}:${path}`)

      return {
        status: "success",
        result: JSON.parse(response.body),
        message: JSON.stringify(JSON.parse(response.body)),
      }
    } else
      throw {
        code: "INVALID-REQUEST-TYPE",
        message: `Expected a request of type: ['GET', 'PUT', 'POST', 'DELETE']. Recieved: ${method}`,
      }
  } catch (err: any) {
    if (err.code === "ENOENT" && err.response === undefined) {
      return {
        status: "error",
        message: "Grendel API connection failed",
        code: err.code,
      }
    } else if (err.code === "EACCES" && err.response === undefined) {
      return {
        status: "error",
        message: "Grendel API socket permission error",
        code: err.code,
      }
    } else if (err.code === "ENOTFOUND" && err.response === undefined) {
      return {
        status: "error",
        message: "Grendel API socket was not found at the specified path",
        code: err.code,
      }
    } else if (err.response !== undefined) {
      return {
        status: "error",
        result: JSON.parse(err.response.body),
        message: JSON.stringify(JSON.parse(err.response.body)),
        code: err.code,
      }
    } else {
      return {
        status: "error",
        result: err,
        code: err.code,
      }
    }
  }
}
export async function getBMC(node: string) {
  let fqdn = ""
  let ip = ""
  let grendelRes: grendelRequest<host[]> = await grendelRequest(`/v1/host/find/${node}`)
  if (grendelRes.result && grendelRes.result.length > 0) {
    let grendelNode = grendelRes.result[0]
    grendelNode.interfaces.forEach((element) => {
      if (element.bmc === true) {
        fqdn = element.fqdn
        ip = element.ip.split("/")[0]
      }
    })

    return {
      status: grendelRes.status,
      address: fqdn,
      ip: ip,
      node: grendelNode,
    }
  } else {
    return {
      status: "error",
      message: `No hosts matching ${node} found`,
    }
  }
}
