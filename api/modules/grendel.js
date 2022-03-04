const { default: got } = require("got")

const grendelSocket = "/home/ubuntu/dcim/grendel/grendel-api.socket"

async function grendelRequest(path, method = "GET", body = {}) {
  try {
    let response = {}
    switch (method) {
      case "GET":
        response = await got(`unix:${grendelSocket}:${path}`)
        break
      case "PUT":
        response = await got.put(`unix:${grendelSocket}:${path}`)
        break
      case "POST":
        response = await got.post(`unix:${grendelSocket}:${path}`, {
          json: body,
        })
        break
      case "DELETE":
        response = await got.delete(`unix:${grendelSocket}:${path}`)
        break
    }
    return { grendelResponse: "success", response: JSON.parse(response.body) }
  } catch (err) {
    if (err.code === "ENOENT" && err.response === undefined) {
      return {
        grendelResponse: "failed",
        response: { message: "Connection to API failed" },
        code: err.code,
      }
    } else {
      return {
        grendelResponse: "failed",
        response: JSON.parse(err.response.body),
        code: err.code,
      }
    }
  }
}
module.exports = grendelRequest
