const express = require("express")
const app = express.Router()
const fetch = require("node-fetch")
const Warranty = require("../models/Warranty")

require("dotenv")
const grendelRequest = require("../modules/grendel")
const { biosApi } = require("../modules/nodeApi")
const { warrantyApiReq } = require("../modules/Warranty")

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

app.get("/add/:tags", async (req, res) => {
  const tags = req.params.tags

  let result = await grendelRequest(`/v1/host/tags/${tags}`)
  if (result.grendelResponse === "success") {
    let arr = []
    for (const nodes of result.response) {
      if (
        nodes.name.substring(0, 3) === "cpn" ||
        nodes.name.substring(0, 3) === "srv"
      ) {
        let query = await Warranty.findOne({ nodeName: nodes.name }).exec()
        if (query === null) {
          let bmc = nodes.interfaces.find((element) => {
            if (element.bmc === true) return true
          })
          let biosRes = await biosApi(bmc.fqdn)
          if (biosRes.message === "success") {
            let st = biosRes.ServiceTag
            arr.push({
              nodeName: nodes.name,
              serviceTag: st,
              bmcFqdn: bmc.fqdn,
            })
          } else {
            console.error(biosRes)
          }
        }
      }
    }
    if (arr.length > 0) {
      let serviceTagString = ""
      if (arr.length > 1) {
        arr.forEach((element) => {
          serviceTagString += element.serviceTag + ","
        })
      } else {
        serviceTagString = arr[0].serviceTag
      }
      let warrantyRes = await warrantyApiReq(serviceTagString)

      if (warrantyRes.status === "success") {
        let data = []
        warrantyRes.result.forEach((val, index) => {
          if (val.invalid === false) {
            let arrData = arr.find((element) => {
              if (element.serviceTag === val.serviceTag) return true
            })
            data.push({
              nodeName: arrData.nodeName,
              bmcFqdn: arrData.bmcFqdn,
              serviceTag: val.serviceTag,
              shipData: val.shipDate,
              productLineDescription: val.productLineDescription,
              entitlements: val.entitlements,
            })
          }
        })

        Warranty.collection.insertMany(data, function (err, warranty) {
          if (err)
            res.json({
              status: "failed",
              message: "An error occured while saving to the DB",
              color: "error",
              err,
            })
          else
            res.json({
              status: "success",
              message:
                warranty.insertedCount + " Nodes successfully added to the DB",
              color: "success",
              warranty: warranty,
            })
        })
      }
    } else {
      res.json({
        status: "failed",
        message: "No new nodes were added to the DB",
        color: "error",
      })
    }
  }
})

app.get("/refresh/:serviceTag", async (req, res) => {
  let token = process.env.JS_DELL_WARRANTY_API_TOKEN
  let serviceTag = req.params.serviceTag
  let warrantyRes = await warrantyAPI(serviceTag, token)

  if (warrantyRes.Fault && warrantyRes.Fault.faultcode === "401") {
    let authRes = await authAPI()
    if (authRes.access_token) {
      process.env.JS_DELL_WARRANTY_API_TOKEN = authRes.access_token
      token = authRes.access_token
    }
    warrantyRes = await warrantyAPI(serviceTag, token)
  }
  res.json({ status: "success", result: warrantyRes })
})

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

module.exports = app
