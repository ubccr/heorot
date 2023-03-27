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
const Nodes = require("../models/Nodes");
const Warranty = require("../models/Warranty");
const { grendelRequest } = require("../modules/grendel");
const { biosApi } = require("../modules/nodeApi");
const { fetch_node } = require("../modules/nodes");
const { warrantyApiReq } = require("../modules/Warranty");
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/warranty" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/warranty/",
        availibleRoutes: routes,
    });
});
app.get("/add/:tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = req.params.tags;
    let response = yield grendelRequest(`/v1/host/tags/${tags}`);
    if (response.status === "success") {
        let arr = [];
        for (const nodes of response.result) {
            if (nodes.name.substring(0, 3) === "cpn" || nodes.name.substring(0, 3) === "srv") {
                let query = yield Warranty.findOne({ nodeName: nodes.name }).exec();
                if (query === null) {
                    let bmc = nodes.interfaces.find((element) => {
                        if (element.bmc === true)
                            return true;
                    });
                    if (bmc !== undefined) {
                        let biosRes = yield biosApi(bmc.fqdn);
                        if (biosRes.message === "success") {
                            let st = biosRes.ServiceTag;
                            arr.push({
                                nodeName: nodes.name,
                                serviceTag: st,
                                bmcFqdn: bmc.fqdn,
                            });
                        }
                        else {
                            console.error(biosRes);
                        }
                    }
                }
            }
        }
        if (arr.length > 0) {
            let serviceTagString = "";
            if (arr.length > 1) {
                arr.forEach((element) => {
                    serviceTagString += element.serviceTag + ",";
                });
            }
            else {
                serviceTagString = arr[0].serviceTag;
            }
            let warrantyRes = yield warrantyApiReq(serviceTagString);
            if (warrantyRes.status === "success") {
                let data = [];
                warrantyRes.result.forEach((val, index) => {
                    if (val.invalid === false) {
                        let arrData = arr.find((element) => {
                            if (element.serviceTag === val.serviceTag)
                                return true;
                        });
                        data.push({
                            nodeName: arrData.nodeName,
                            bmcFqdn: arrData.bmcFqdn,
                            serviceTag: val.serviceTag,
                            shipDate: val.shipDate,
                            productLineDescription: val.productLineDescription,
                            entitlements: val.entitlements,
                        });
                    }
                });
                Warranty.collection.insertMany(data, function (err, warranty) {
                    if (err)
                        res.json({
                            status: "error",
                            message: "An error occured while saving to the DB",
                            color: "error",
                            err,
                        });
                    else
                        res.json({
                            status: "success",
                            message: warranty.insertedCount + " Nodes successfully added to the DB",
                            color: "success",
                            warranty: warranty,
                        });
                });
            }
        }
        else {
            res.json({
                status: "error",
                message: "No new nodes were added to the DB",
                color: "error",
            });
        }
    }
}));
app.get("/get/:node", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const node = req.params.node;
    Warranty.findOne({ nodeName: node }, function (err, node) {
        if (err) {
            res.json({
                status: "error",
                message: "An error occured while accessing the DB",
                color: "error",
                err,
            });
        }
        else {
            if (node !== null) {
                let result = {};
                node.entitlements.forEach((val, index) => {
                    if (val.serviceLevelCode === "ND" || val.serviceLevelCode === "P+") {
                        let date = new Date(val.endDate);
                        let currentDate = new Date();
                        if (date > currentDate) {
                            result = {
                                status: "success",
                                result: {
                                    warranty: "valid",
                                    endDate: date,
                                    entitlementType: val.entitlementType,
                                },
                            };
                        }
                        else {
                            result = {
                                status: "success",
                                result: {
                                    warranty: "invalid",
                                    endDate: date,
                                    entitlementType: val.entitlementType,
                                },
                            };
                        }
                    }
                });
                res.json(result);
            }
            else {
                res.json({
                    status: "error",
                    message: "Warranty information for node not found",
                });
            }
        }
    });
}));
app.post("/v1/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _q, _10, _11;
    /*
    body: {
      tags?: ["foo", "bar"],
      refresh?: false,
      service_tags: ["AAA000", "BBB000"]
    }
    */
    const tags = (_j = req.body.tags) === null || _j === void 0 ? void 0 : _j.join(",");
    const refresh = (_10 = (_q = req.body) === null || _q === void 0 ? void 0 : _q.refresh) !== null && _10 !== void 0 ? _10 : false;
    const service_tags = (_11 = req.body) === null || _11 === void 0 ? void 0 : _11.service_tags;
    if (service_tags !== undefined) {
        // skip node queries to allow for nodes not in DB
        let warranty_res = yield warrantyApiReq(filtered_service_tag_arr.join(","));
        res.json(warranty_res);
        return;
    }
    // Get list of nodes from grendel
    let grendel_res = {};
    if (tags === undefined || tags === "") {
        grendel_res = yield grendelRequest(`/v1/host/list`);
    }
    else {
        grendel_res = yield grendelRequest(`/v1/host/tags/${tags}`);
    }
    if (grendel_res.status !== "success") {
        res.json(grendel_res);
        return;
    }
    // generate string of service tags
    let db_query = yield Nodes.find({}, { node: 1, redfish: { service_tag: 1 }, warranty: 1 });
    let service_tag_arr = yield Promise.all(grendel_res.result.map((grendel_val) => __awaiter(void 0, void 0, void 0, function* () {
        var _12, _13;
        // find node in db query
        let match = db_query.find((db_val) => db_val.node === grendel_val.name);
        // if no ST is found attempt to query node
        if (match && ((_12 = match.redfish) === null || _12 === void 0 ? void 0 : _12.service_tag) === undefined) {
            match = yield fetch_node(grendel_val.name, "true");
            if (match && ((_13 = match.redfish) === null || _13 === void 0 ? void 0 : _13.service_tag) === undefined)
                return; // if still no ST is found, return
        }
        if (refresh && match) {
            return match.redfish.service_tag; // return ST if found && refresh === true
        }
        else if (!refresh && match && match.warranty.entitlements.length === 0) {
            return match.redfish.service_tag; // return ST if found, refresh === false, and db entry has no warranty entitlements
        }
    })));
    let filtered_service_tag_arr = service_tag_arr.filter(Boolean);
    if (filtered_service_tag_arr.length === 0) {
        let response = refresh === true
            ? { status: "error", message: "No nodes were found " }
            : { status: "success", message: "No new nodes found" };
        res.json(response);
        return;
    }
    // Dell query
    let warranty_res = yield warrantyApiReq(filtered_service_tag_arr.join(","));
    if (warranty_res.status !== "success") {
        res.json(warranty_res);
        return;
    }
    // DB update
    let modified_count = 0;
    for (const val of warranty_res.result) {
        let filter = { "redfish.service_tag": val.serviceTag };
        let update = {
            warranty: {
                shipDate: val.shipDate,
                productLineDescription: val.productLineDescription,
                entitlements: val.entitlements,
            },
        };
        let db_res = yield Nodes.updateOne(filter, update);
        if (db_res.modifiedCount === 1)
            modified_count++;
    }
    res.json({ status: "success", message: `${modified_count} out of ${warranty_res.result.length} nodes updated` });
}));
app.get("/v1/get/:node", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const node = req.params.node;
    let db_res = yield Nodes.findOne({ node: node }, { warranty: 1 });
    res.json(db_res);
}));
module.exports = app;
