import { Router } from "express"
import config from "../../config/config.js"
import { grendelRequest } from "../modules/grendel.js"
const app = Router()

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/grendel" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/grendel/",
    availableRoutes: routes,
  })
})
// --- hosts ---
app.get("/host/list", async (req, res) => {
  res.json(await grendelRequest("/v1/host/list"))
})
app.get("/host/find/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/find/${nodeset}`))
})
app.get("/host/tags/:tags", async (req, res) => {
  const tags = req.params.tags
  res.json(await grendelRequest(`/v1/host/tags/${tags}`))
})

app.post("/host", async (req, res) => {
  /*
  body: [
    {
        "name": "ut dolor nostrud",
        "id": "deserunt Excepteur proident",
        "provision": true,
        "firmware": "magna sit fugiat",
        "boot_image": "irure consectetur ipsum tempor",
        "interfaces": [
            {
                "mac": "in ipsum dolore ex",
                "name": "sunt dolore minim",
                "ip": "aliqua dolor aliquip",
                "fqdn": "consectetur",
                "bmc": false
            },
            {
                "mac": "magna ipsum ",
                "name": "exercitation",
                "ip": "sint",
                "fqdn": "non eu dolore occaecat",
                "bmc": false
            }
        ]
    },
  ]
  */
  // IP address check:
  if (typeof req.body === "object" && req.body.length > 0) {
    let tmp = req.body.map((val: any) => {
      return val.interfaces?.every((iface: any) =>
        iface.ip.match("[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2}")
      )
    })
    if (tmp.every((val: any) => val)) res.json(await grendelRequest(`/v1/host`, "POST", req.body))
    else res.json({ status: "error", message: "Interface IP address is invalid or missing" })
  } else res.json({ status: "error", message: "Request body is not an Array" })
})

app.get("/delete/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/find/${nodeset}`, "DELETE"))
})

app.get("/provision/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/provision/${nodeset}`, "PUT"))
})
app.get("/unprovision/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/host/unprovision/${nodeset}`, "PUT"))
})
app.get("/tag/:nodeset/:tags", async (req, res) => {
  const nodeset = req.params.nodeset
  const tags = req.params.tags
  res.json(await grendelRequest(`/v1/host/tag/${nodeset}?tags=${tags}`, "PUT"))
})
app.get("/untag/:nodeset/:tags", async (req, res) => {
  const nodeset = req.params.nodeset
  const tags = req.params.tags
  res.json(await grendelRequest(`/v1/host/untag/${nodeset}?tags=${tags}`, "PUT"))
})

// --- images ---
app.get("/image/list", async (req, res) => {
  res.json(await grendelRequest(`/v1/bootimage/list`))
})
app.get("/image/find/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/bootimage/find/${nodeset}`))
})
app.post("/image", async (req, res) => {
  /*
  body: [
    {
        "name": "non cillum veniam",
        "id": "ex dolore",
        "kernel": "ex in laboris voluptate ut",
        "initrd": [
            "est fugiat pariatur voluptate",
            "in"
        ],
        "liveimg": "ullamco in laboris ea",
        "cmdline": "ut Excepteur",
        "verify": false
    },
  ]
  */
  res.json(await grendelRequest(`/v1/bootimage`, "POST", req.body))
})
app.delete("/image/delete/:nodeset", async (req, res) => {
  const nodeset = req.params.nodeset
  res.json(await grendelRequest(`/v1/bootimage/find/${nodeset}`, "DELETE"))
})

// --- misc ---
app.get("/firmware/list", async (req, res) => {
  res.json({
    status: "success",
    result: config.settings.boot_firmware,
  })
})

export default app
