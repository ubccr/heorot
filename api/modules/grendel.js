const { default: got } = require("got")

let config = require("../config")

async function grendelRequest(path, method = "GET", body = {}) {
  try {
    let response = {}
    switch (method) {
      case "GET":
        response = await got(`unix:${config.grendel.socket}:${path}`)
        break
      case "PUT":
        response = await got.put(`unix:${config.grendel.socket}:${path}`)
        break
      case "POST":
        response = await got.post(`unix:${config.grendel.socket}:${path}`, {
          json: body,
        })
        break
      case "DELETE":
        response = await got.delete(`unix:${config.grendel.socket}:${path}`)
        break
    }
    return { status: "success", result: JSON.parse(response.body) }
  } catch (err) {
    if (err.code === "ENOENT" && err.response === undefined) {
      return {
        status: "error",
        result: { message: "Connection to API failed" },
        code: err.code,
      }
    } else {
      return {
        status: "error",
        result: JSON.parse(err.response.body),
        code: err.code,
      }
    }
  }
}
module.exports = grendelRequest
