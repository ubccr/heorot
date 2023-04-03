import { Nodes } from "../models/Nodes.js"
import { Warranty } from "../models/Warranty.js"
import { biosApi } from "../modules/nodeApi.js"
import express from "express"
import { fetch_node } from "../modules/nodes.js"
import { grendelRequest } from "../modules/grendel.js"
import { warrantyApiReq } from "../modules/Warranty.js"
const app = express.Router()

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/warranty" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/warranty/",
    availibleRoutes: routes,
  })
})

app.get("/add/:tags", async (req, res) => {
  const tags = req.params.tags

  let response = await grendelRequest(`/v1/host/tags/${tags}`)
  if (response.status === "success") {
    let arr: any = []
    for (const nodes of response.result) {
      if (nodes.name.substring(0, 3) === "cpn" || nodes.name.substring(0, 3) === "srv") {
        let query = await Warranty.findOne({ nodeName: nodes.name }).exec()
        if (query === null) {
          let bmc = nodes.interfaces.find((element: any) => {
            if (element.bmc === true) return true
          })
          if (bmc !== undefined) {
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
    }
    if (arr.length > 0) {
      let serviceTagString = ""
      if (arr.length > 1) {
        arr.forEach((element: any) => {
          serviceTagString += element.serviceTag + ","
        })
      } else {
        serviceTagString = arr[0].serviceTag
      }
      let warrantyRes: any = await warrantyApiReq(serviceTagString)

      if (warrantyRes.status === "success") {
        let data: any = []
        warrantyRes.result.forEach((val: any) => {
          if (val.invalid === false) {
            let arrData = arr.find((element: any) => {
              if (element.serviceTag === val.serviceTag) return true
            })
            data.push({
              nodeName: arrData.nodeName,
              bmcFqdn: arrData.bmcFqdn,
              serviceTag: val.serviceTag,
              shipDate: val.shipDate,
              productLineDescription: val.productLineDescription,
              entitlements: val.entitlements,
            })
          }
        })
        try {
          let warranty_insert_res = await Warranty.collection.insertMany(data)
          res.json({
            status: "success",
            message: warranty_insert_res.insertedCount + " Nodes successfully added to the DB",
            color: "success",
            warranty: warranty_insert_res,
          })
        } catch (err) {
          res.json({
            status: "error",
            message: "An error occured while saving to the DB",
            color: "error",
            err,
          })
        }
      }
    } else {
      res.json({
        status: "error",
        message: "No new nodes were added to the DB",
        color: "error",
      })
    }
  }
})

app.get("/get/:node", async (req, res) => {
  const node = req.params.node

  Warranty.findOne({ nodeName: node }, function (err: any, node: any) {
    if (err) {
      res.json({
        status: "error",
        message: "An error occured while accessing the DB",
        color: "error",
        err,
      })
    } else {
      if (node !== null) {
        let result = {}
        node.entitlements.forEach((val: any) => {
          if (val.serviceLevelCode === "ND" || val.serviceLevelCode === "P+") {
            let date = new Date(val.endDate)
            let currentDate = new Date()

            if (date > currentDate) {
              result = {
                status: "success",
                result: {
                  warranty: "valid",
                  endDate: date,
                  entitlementType: val.entitlementType,
                },
              }
            } else {
              result = {
                status: "success",
                result: {
                  warranty: "invalid",
                  endDate: date,
                  entitlementType: val.entitlementType,
                },
              }
            }
          }
        })
        res.json(result)
      } else {
        res.json({
          status: "error",
          message: "Warranty information for node not found",
        })
      }
    }
  })
})

app.post("/v1/add", async (req, res) => {
  /*
  body: {
    tags?: ["foo", "bar"],
    refresh?: false,
    service_tags: ["AAA000", "BBB000"]
  }
  */
  const tags = req.body.tags?.join(",")
  const refresh = req.body?.refresh ?? false
  const service_tags = req.body?.service_tags

  if (service_tags !== undefined) {
    // skip node queries to allow for nodes not in DB
    let warranty_res = await warrantyApiReq(service_tags.join(","))
    res.json(warranty_res)
    return
  }

  // Get list of nodes from grendel
  let grendel_res: any = {}
  if (tags === undefined || tags === "") {
    grendel_res = await grendelRequest(`/v1/host/list`)
  } else {
    grendel_res = await grendelRequest(`/v1/host/tags/${tags}`)
  }
  if (grendel_res.status !== "success") {
    res.json(grendel_res)
    return
  }

  // generate string of service tags
  let db_query = await Nodes.find({}, { node: 1, redfish: { service_tag: 1 }, warranty: 1 })

  let service_tag_arr = await Promise.all(
    grendel_res.result.map(async (grendel_val: any) => {
      // find node in db query
      let match: any = db_query.find((db_val: any) => db_val.node === grendel_val.name)
      // if no ST is found attempt to query node
      if (match && match.redfish?.service_tag === undefined) {
        match = await fetch_node(grendel_val.name, "true")
        if (match && match.redfish?.service_tag === undefined) return // if still no ST is found, return
      }
      if (refresh && match) {
        return match.redfish.service_tag // return ST if found && refresh === true
      } else if (!refresh && match && match.warranty.entitlements.length === 0) {
        return match.redfish.service_tag // return ST if found, refresh === false, and db entry has no warranty entitlements
      }
    })
  )

  let filtered_service_tag_arr = service_tag_arr.filter(Boolean)

  if (filtered_service_tag_arr.length === 0) {
    let response =
      refresh === true
        ? { status: "error", message: "No nodes were found " }
        : { status: "success", message: "No new nodes found" }
    res.json(response)
    return
  }

  // Dell query
  let warranty_res = await warrantyApiReq(filtered_service_tag_arr.join(","))

  if (warranty_res.status !== "success") {
    res.json(warranty_res)
    return
  }
  // DB update
  let modified_count = 0
  for (const val of warranty_res.result) {
    let filter = { "redfish.service_tag": val.serviceTag }
    let update = {
      warranty: {
        shipDate: val.shipDate,
        productLineDescription: val.productLineDescription,
        entitlements: val.entitlements,
      },
    }
    let db_res = await Nodes.updateOne(filter, update)
    if (db_res.modifiedCount === 1) modified_count++
  }

  res.json({ status: "success", message: `${modified_count} out of ${warranty_res.result.length} nodes updated` })
})

app.get("/v1/get/:node", async (req, res) => {
  const node = req.params.node

  let db_res = await Nodes.findOne({ node: node }, { warranty: 1 })
  res.json(db_res)
})

export default app
