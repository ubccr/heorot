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
const { grendelRequest } = require("../modules/grendel");
const { rackGen, floorplan } = require("../modules/client");
const config = require("../config");
const Switches = require("../models/Switches");
const Nodes = require("../models/Nodes");
const { fetch_node } = require("../modules/nodes");
const Settings = require("../models/Settings");
const { encrypt, decrypt } = require("../modules/encryption");
const { syncDBSettings } = require("../modules/db");
const { getCache, timeComp } = require("../modules/cache");
const { getSw } = require("../modules/switches");
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/client" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/client/",
        availibleRoutes: routes,
    });
});
app.get("/v1/floorPlan", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let grendel_query = yield grendelRequest("/v1/host/list");
    let switch_query = yield Switches.find({ node: /^swe/ });
    if (grendel_query.status === "success" && switch_query !== null) {
        let funcRes = floorplan(grendel_query, switch_query, config);
        res.json(funcRes);
    }
    else
        res.json({
            status: "error",
            message: "Failed to fetch Grendel or Switch Data",
            error: { location: "/api/routes/client.js", grendel_query, switch_query },
        });
}));
app.get("/v1/rack/:rack/:refetch?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const rack = req.params.rack;
    const refetch = (_j = req.params.refetch) !== null && _j !== void 0 ? _j : "false";
    let grendel_res = yield grendelRequest(`/v1/host/tags/${rack}`);
    // let grendel_res_all = await grendelRequest(`/v1/host/list`) need to change filter functions in rackGen
    if (grendel_res.status === "error")
        res.json(grendel_res);
    // let grendel_res = grendel_res_all.result.filter((node) => node.name.split("-")[1] === rack)
    let rackArr = [];
    for (let x = config.settings.rack.min; x <= config.settings.rack.max; x++) {
        rackArr[x] = {
            u: x,
            type: "",
        };
    }
    let nodes = yield rackGen(grendel_res, rackArr.filter(Boolean), refetch);
    // offset function | needed because of how html tables generate, multi u nodes need their data in the top most u, all other u's must be a rowspan cell
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].height > 1) {
            let offset = i + nodes[i].height - 1;
            let offsetU = nodes[offset].u;
            nodes[offset] = Object.assign(Object.assign({}, nodes[i]), { u: offsetU });
            nodes[i] = { u: nodes[i].u, type: "rowSpan", height: nodes[i].height, width: nodes[i].width, grendel: [] };
            // set other el to rowspan
            for (let x = 1; x < nodes[i].height; x++) {
                nodes[i + x - 1].type = "rowSpan";
            }
            i += nodes[i].height - 1; // skip
        }
    }
    res.json({
        status: "success",
        rack: rack,
        nodes: nodes.reverse(),
        // pdu: [],
    });
}));
app.get("/v1/node/:node/:refresh?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _10, _11;
    const node = req.params.node;
    const refresh = (_q = req.params.refresh) !== null && _q !== void 0 ? _q : "false";
    let rack = (_10 = node.split("-")[1]) !== null && _10 !== void 0 ? _10 : "";
    let nodeRes = yield grendelRequest(`/v1/host/find/${node}`);
    let rack_res = yield grendelRequest(`/v1/host/tags/${rack}`);
    let boot_image_res = yield grendelRequest(`/v1/bootimage/list`);
    let boot_image_list = boot_image_res.status === "success" ? boot_image_res.result : [];
    if (nodeRes.status === "success" && nodeRes.result.length > 0 && rack_res.status === "success") {
        let nodeList = rack_res.result.map((val) => val.name).sort((a, b) => a.split("-")[2] - b.split("-")[2]);
        let prevNode = nodeList.indexOf(node) < nodeList.length - 1 ? nodeList[nodeList.indexOf(node) + 1] : nodeList[0];
        let nextNode = nodeList.indexOf(node) > 0 ? nodeList[nodeList.indexOf(node) - 1] : nodeList[nodeList.length - 1];
        let message = undefined;
        if (nodeRes.result.length > 1) {
            message = "Warning: More than one node with matching name found.";
            nodeRes.result.forEach((node) => (message += ` id: ${node.id}`));
        }
        let bmcPlugin = false;
        if (config.settings.bmc.username !== "")
            bmcPlugin = true;
        if (refresh === "true")
            yield fetch_node(node, refresh);
        let dbRequest = yield Nodes.findOne({ node: node });
        // Switches:
        let switch_data = { status: "error", message: "Failed to get switch data" };
        if (node.split("-")[0] === "swe") {
            let getCacheRes = yield getCache(node);
            if (getCacheRes !== null && refresh !== "true" && getCacheRes.cache.status !== "error") {
                if (timeComp(getCacheRes.updatedAt))
                    getSw(node);
                switch_data = getCacheRes.cache;
            }
            else {
                switch_data = yield getSw(node);
            }
        }
        res.json({
            status: "success",
            node: node,
            previous_node: prevNode,
            next_node: nextNode,
            result: nodeRes.result[0],
            redfish: dbRequest === null || dbRequest === void 0 ? void 0 : dbRequest.redfish,
            switch_data: switch_data,
            warranty: dbRequest === null || dbRequest === void 0 ? void 0 : dbRequest.warranty,
            notes: (_11 = dbRequest === null || dbRequest === void 0 ? void 0 : dbRequest.notes) !== null && _11 !== void 0 ? _11 : "",
            firmware_options: config.settings.boot_firmware,
            boot_image_options: boot_image_list,
            message: message,
            bmc_plugin: bmcPlugin,
        });
    }
    else {
        res.json({
            status: "error",
            message: "Node not found",
            error: { nodeRes, rack_res },
        });
    }
}));
app.post("/v1/notes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    body: {
      new_notes: { updated notes },
      old_notes: { old notes },
      overwrite?: true | false
    }
  */
    let query_verify = yield Nodes.findOne({ node: req.body.node });
    if (req.body.overwrite !== true && query_verify.notes !== undefined && query_verify.notes !== req.body.old_notes) {
        res.json({
            status: "error",
            message: "Error, notes have been modified by another user! Submit again to overwrite changes.",
            code: "EOVERWRITE",
            overwrite: query_verify.notes,
        });
        return;
    }
    let query = yield Nodes.updateOne({ node: req.body.node }, { notes: req.body.new_notes });
    if (query.modifiedCount > 0)
        res.json({ status: "success", message: "Successfully updated notes!" });
    else
        res.json({ status: "error", message: "Error, notes unchanged" });
}));
app.get("/v1/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let query = yield Settings.find({}, {
        _id: 0,
        __v: 0,
        jwt_secret: 0,
        "bmc.password": 0,
        "switches.password": 0,
        "openmanage.password": 0,
        "dell_warranty_api.id": 0,
        "dell_warranty_api.secret": 0,
    });
    res.json(query);
}));
app.post("/v1/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    body: {
      { updated Settings model },
    }
  */
    let query = yield Settings.find({}, { _id: 0, __v: 0, jwt_secret: 0 });
    let old_settings = query[0];
    req.body.bmc.password =
        req.body.bmc.password !== "" ? yield encrypt(req.body.bmc.password) : old_settings.bmc.password;
    req.body.switches.password =
        req.body.switches.password !== "" ? yield encrypt(req.body.switches.password) : old_settings.switches.password;
    req.body.openmanage.password =
        req.body.openmanage.password !== "" ? yield encrypt(req.body.openmanage.password) : old_settings.openmanage.password;
    req.body.dell_warranty_api.id =
        req.body.dell_warranty_api.id !== ""
            ? yield encrypt(req.body.dell_warranty_api.id)
            : old_settings.dell_warranty_api.id;
    req.body.dell_warranty_api.secret =
        req.body.dell_warranty_api.secret !== ""
            ? yield encrypt(req.body.dell_warranty_api.secret)
            : old_settings.dell_warranty_api.secret;
    let db_res = yield Settings.updateOne({}, { $set: req.body });
    if (db_res.acknowledged === true && db_res.matchedCount === 1) {
        res.json({ status: "success", message: `Successfully saved settings` });
        syncDBSettings();
    }
    else
        res.status(400).json({ status: "error", message: "Error saving to DB", error: db_res });
}));
module.exports = app;
