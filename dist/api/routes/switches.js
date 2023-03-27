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
const Cache = require("../models/Cache");
const Switches = require("../models/Switches");
const { setCache, getCache, timeComp } = require("../modules/cache");
const { getSwInfoV2 } = require("../modules/switches");
const { grendelRequest } = require("../modules/grendel");
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/switches" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/switches/",
        availibleRoutes: routes,
    });
});
app.get("/v1/query/:node/:refetch?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const node = req.params.node;
    const refetch = req.params.refetch;
    let getCacheRes = yield getCache(node);
    if (getCacheRes !== null && refetch !== "true" && getCacheRes.cache.status !== "error") {
        if (timeComp(getCacheRes.updatedAt))
            getSw(node);
        res.json(getCacheRes.cache);
    }
    else {
        let resSw = yield getSw(node);
        res.json(resSw);
    }
}));
const getSw = (node) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _q, _10, _11, _12;
    let res = yield getSwInfoV2(node);
    let setCacheRes = yield setCache(node, res);
    // New switches DB collection
    if (res.status === "success") {
        // TODO: modify switch queries to match DB name scheme
        let data = {
            node: node,
            interfaces: res.result[1].output,
            mac_address_table: res.result[2].output,
            system: {
                model: (_j = res.result[0].output.model) !== null && _j !== void 0 ? _j : "",
                uptime: (_q = res.result[0].output.uptime) !== null && _q !== void 0 ? _q : "",
                version: (_10 = res.result[0].output.version) !== null && _10 !== void 0 ? _10 : "",
                vendor: (_11 = res.result[0].output.vendor) !== null && _11 !== void 0 ? _11 : "",
                service_tag: (_12 = res.result[0].output.serviceTag) !== null && _12 !== void 0 ? _12 : "",
            },
            info: {
                total_oversubscription: res.info.totalOversubscription,
                active_oversubscription: res.info.activeOversubscription,
                total_ports: res.info.totalPorts,
                active_ports: res.info.activePorts,
                fastest_port: res.info.fastestPort,
                uplink_count: res.info.uplinkCount,
                uplink_speed: res.info.uplinkSpeed,
                uplinks: res.info.uplinks,
            },
        };
        // TODO: error handling
        yield Switches.findOneAndUpdate({ node: node }, data, { new: true, upsert: true });
    }
    return res;
});
app.get("/v1/refetchAll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let grendelRes = yield grendelRequest(`/v1/host/tags/switch`);
    if (grendelRes.status === "success") {
        let output = yield Promise.all(grendelRes.result.map((val) => __awaiter(void 0, void 0, void 0, function* () { return yield getSw(val.name); })));
        let failed = output
            .map((val) => {
            if (val.status !== "success")
                return val.message;
        })
            .filter(Boolean);
        let status = failed.length > output.length ? "error" : "success";
        let message = `Successfully updated ${output.length} switches, Failed to update ${failed.length} switches`;
        res.json({ status, message, result: output, failed });
    }
    else
        res.json(grendelRes);
}));
// app.get("/v1/allSwitches", async (req, res) => {
//   let switchesQuery = await Cache.find({ node: /^swe/ })
//   if (switchesQuery !== null) {
//     let tmp = switchesQuery
//       .map((val) => {
//         if (val.cache.status !== "error")
//           return { node: val.node, status: val.cache.status, info: val.cache.info, result: val.cache.result[0] }
//       })
//       .filter(Boolean)
//     res.json({ status: "success", result: tmp })
//   } else res.json({ status: "error", message: "Failed to load cached switches from the DB", silent: true })
// })
module.exports = app;
