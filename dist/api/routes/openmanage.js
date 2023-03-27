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
const https = require("https");
const fetch = require("node-fetch");
let config = require("../config");
const agent = new https.Agent({
    rejectUnauthorized: false,
});
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/openmanage" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/openmanage/",
        availibleRoutes: routes,
    });
});
app.get("/nodes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let warningNodes = [];
    let criticalNodes = [];
    let url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 3000`;
    let warningRes = yield apiRequest(config.settings.openmanage.address + url);
    url = `/api/DeviceService/Devices?$orderby=DeviceName desc &$filter=Status eq 4000`;
    let criticalRes = yield apiRequest(config.settings.openmanage.address + url);
    if (warningRes.status === "success") {
        warningRes.result.forEach((element) => {
            warningNodes.push({
                id: element.Id,
                deviceName: element.DeviceManagement[0].InstrumentationName,
                serviceTag: element.DeviceServiceTag,
                status: element.Status,
                bmcName: element.DeviceManagement[0].DnsName,
            });
        });
    }
    if (criticalRes.status === "success") {
        criticalRes.result.forEach((element) => {
            criticalNodes.push({
                id: element.Id,
                deviceName: element.DeviceManagement[0].InstrumentationName,
                bmcName: element.DeviceManagement[0].DnsName,
                serviceTag: element.DeviceServiceTag,
                status: element.Status,
            });
        });
    }
    if ((warningRes.status === "success") & (criticalRes.status === "success")) {
        res.json({ status: "success", result: { warningNodes, criticalNodes } });
    }
    else {
        res.json({
            status: "error",
            message: "OME API call error",
            error: warningRes,
            criticalRes,
        });
    }
}));
app.get("/health/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = config.settings.openmanage.address + "/api/DeviceService/Devices(" + req.params.id + ")/SubSystemHealth";
    try {
        let api_res = yield apiRequest(url);
        if (api_res.status === "error" || api_res.result === undefined)
            throw {
                status: "error",
                message: `Error fetching SubSystemHealth for ID: ${req.params.id}`,
            };
        let output = { status: "success", result: {} };
        api_res.result.forEach((element) => {
            let fault = null;
            if (element.FaultList !== undefined)
                fault = element.FaultList[0].Message;
            output.result[element.SubSystem] = {
                subSystem: element.SubSystem,
                status: icons(element.RollupStatus),
                message: fault,
            };
        });
        res.json(output);
    }
    catch (error) {
        res.json(error);
    }
}));
function icons(status) {
    if (status === "4000") {
        return "Critical";
    }
    else if (status === "3000") {
        return "Warning";
    }
    else if (status === "1000") {
        return "Good";
    }
    else {
        return "Unknown";
    }
}
function apiRequest(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let omeEncoded = Buffer.from(config.settings.openmanage.username + ":" + config.settings.openmanage.password).toString("base64");
        let omeAuth = "Basic " + omeEncoded;
        let http_header = {
            headers: {
                method: "GET",
                Authorization: omeAuth,
                credentials: "include",
            },
            agent,
        };
        try {
            let fetch_res = yield fetch(url, http_header);
            const json_res = yield fetch_res.json();
            return {
                status: "success",
                result: json_res.value,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: "API Request error",
                error,
            };
        }
    });
}
module.exports = app;
