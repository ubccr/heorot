"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const app = express.Router();
let config = require("../config");
const { grendelRequest } = require("../modules/grendel");
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/grendel" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/grendel/",
        availableRoutes: routes,
    });
});
// --- hosts ---
app.get("/host/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield grendelRequest("/v1/host/list"));
}));
app.get("/host/find/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/host/find/${nodeset}`));
}));
app.get("/host/tags/:tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = req.params.tags;
    res.json(yield grendelRequest(`/v1/host/tags/${tags}`));
}));
app.post("/host", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let tmp = req.body.map((val) => {
            var _j;
            return (_j = val.interfaces) === null || _j === void 0 ? void 0 : _j.every((iface) => iface.ip.match("[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2}"));
        });
        if (tmp.every((val) => val))
            res.json(yield grendelRequest(`/v1/host`, "POST", req.body));
        else
            res.json({ status: "error", message: "Interface IP address is invalid or missing" });
    }
    else
        res.json({ status: "error", message: "Request body is not an Array" });
}));
app.get("/delete/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/host/find/${nodeset}`, "DELETE"));
}));
app.get("/provision/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/host/provision/${nodeset}`, "PUT"));
}));
app.get("/unprovision/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/host/unprovision/${nodeset}`, "PUT"));
}));
app.get("/tag/:nodeset/:tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    const tags = req.params.tags;
    res.json(yield grendelRequest(`/v1/host/tag/${nodeset}?tags=${tags}`, "PUT"));
}));
app.get("/untag/:nodeset/:tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    const tags = req.params.tags;
    res.json(yield grendelRequest(`/v1/host/untag/${nodeset}?tags=${tags}`, "PUT"));
}));
// --- images ---
app.get("/image/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield grendelRequest(`/v1/bootimage/list`));
}));
app.get("/image/find/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/bootimage/find/${nodeset}`));
}));
app.post("/image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    res.json(yield grendelRequest(`/v1/bootimage`, "POST", req.body));
}));
app.delete("/image/delete/:nodeset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodeset = req.params.nodeset;
    res.json(yield grendelRequest(`/v1/bootimage/find/${nodeset}`, "DELETE"));
}));
// --- misc ---
app.get("/firmware/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        status: "success",
        result: config.settings.boot_firmware,
    });
}));
module.exports = app;
