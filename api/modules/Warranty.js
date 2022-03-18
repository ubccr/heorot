const fetch = require("node-fetch")

require("dotenv")

async function warrantyApiReq(serviceTag) {
  let token = process.env.JS_DELL_WARRANTY_API_TOKEN
  let warrantyRes = await warrantyAPI(serviceTag, token)

  if (warrantyRes.Fault && warrantyRes.Fault.faultcode === "401") {
    let authRes = await authAPI()
    if (authRes.access_token) {
      process.env.JS_DELL_WARRANTY_API_TOKEN = authRes.access_token
      token = authRes.access_token
    }
    warrantyRes = await warrantyAPI(serviceTag, token)
  }
  return { status: "success", result: warrantyRes }
}

async function authAPI() {
  const url = `https://apigtwb2c.us.dell.com/auth/oauth/v2/token`
  const clientId = process.env.JS_DELL_WARRANTY_API_ID
  const clientSecret = process.env.JS_DELL_WARRANTY_API_SECRET

  let params = new URLSearchParams()

  params.append("client_id", clientId)
  params.append("client_secret", clientSecret)
  params.append("grant_type", "client_credentials")

  let payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  }
  return await (await fetch(url, payload)).json()
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

module.exports = { warrantyApiReq }
