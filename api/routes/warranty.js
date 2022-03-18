const express = require("express")
const app = express.Router()

require("dotenv")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/warranty/",
    availibleRoutes: routes,
  })
})

app.get("/:serviceTag", async (req, res) => {
  let serviceTag = req.params.serviceTag
  let warrantyRes = await warrantyAPI(serviceTag, token)

  if (warrantyRes) {
    // if error = 401
    let authRes = await authAPI()
    // set token
    warrantyRes = await warrantyAPI(serviceTag, token)
  }
  res.json({ status: "success", result: warrantyRes })
})

function authAPI() {
  const url = `https://apigtwb2c.us.dell.com/auth/oauth/v2/token`
  const clientId = ""
  const clientSecret = ""
  let payload = {
    headers: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      "content-type": "application/json",
    },
  }
  return await(await fetch(url, payload)).json()
}
async function warrantyAPI(serviceTag, token) {
  const url = `https://apigtwb2c.us.dell.com/PROD/sbil/eapi/v5/asset-entitlements?servicetags=${serviceTag}`
  let payload = {
    headers: {
      Authorization: "Bearer " + token,
      "content-type": "application/json",
    },
  }
  return await (await fetch(url, payload)).json()
}

module.exports = app
