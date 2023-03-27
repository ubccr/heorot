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
const config = require("../config");
const Nodes = require("../models/Nodes");
const { grendelRequest } = require("./grendel");
const { redfishRequest } = require("./redfish.ts");
const fetch_node = (node, refetch) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _q;
    let status = "error";
    let db_res = yield Nodes.findOne({ node: node });
    // || db_res?.redfish.status === "error"
    if (refetch === "true" || db_res === null) {
        let grendel = yield grendelRequest(`/v1/host/find/${node}`);
        if (grendel.status !== "success")
            return grendel;
        let redfish = yield redfishRequest(node);
        let old_data = yield Nodes.findOneAndUpdate({ node: node }, { node: node, grendel, redfish }, { new: true, upsert: true });
        status = [grendel.status, redfish.status].includes("error") ? "error" : "success";
        return {
            status: status,
            node: node,
            grendel,
            redfish,
            notes: (_j = old_data.notes) !== null && _j !== void 0 ? _j : "",
        };
    }
    else {
        status = [db_res.grendel.status, db_res.redfish.status].includes("error") ? "error" : "success";
        return {
            status: status,
            node: node,
            grendel: db_res.grendel,
            redfish: db_res.redfish,
            notes: (_q = db_res.notes) !== null && _q !== void 0 ? _q : "",
        };
    }
});
const refetch_all_nodes = (minutes = 0) => __awaiter(void 0, void 0, void 0, function* () {
    if (minutes === 0)
        return;
    console.log("Starting refresh of Redfish data");
    let expired_time = new Date();
    expired_time.setMinutes(expired_time.getMinutes() - minutes);
    let nodes = yield Nodes.find({}, { node: 1, redfish: 1, _id: 0, updatedAt: 1 });
    // console.log(nodes.filter((val) => val.updatedAt < expired_time))
    let response = yield Promise.all(nodes.filter((val) => val.updatedAt < expired_time).map((node) => fetch_node(node.node, "true")));
    return response;
});
function schedule_node_refresh() {
    var _j, _q;
    refetch_all_nodes((_q = (_j = config.settings.bmc) === null || _j === void 0 ? void 0 : _j.refresh_interval) !== null && _q !== void 0 ? _q : 0)
        .then(function () {
        var _j, _q, _10, _11;
        console.log(`Refreshed all Redfish data, waiting ${(_j = config.settings.bmc) === null || _j === void 0 ? void 0 : _j.refresh_interval} minute(s)`);
        if (((_q = config.settings.bmc) === null || _q === void 0 ? void 0 : _q.refresh_interval) > 0) {
            setTimeout(function () {
                console.log("Refetching Redfish data...");
                schedule_node_refresh();
            }, (_11 = 1000 * 60 * ((_10 = config.settings.bmc) === null || _10 === void 0 ? void 0 : _10.refresh_interval)) !== null && _11 !== void 0 ? _11 : 60);
        }
    })
        .catch((err) => console.error("Error refreshing Redfish data automatically", err));
}
schedule_node_refresh();
module.exports = { fetch_node, schedule_node_refresh };
