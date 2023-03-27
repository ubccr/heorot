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
// TODO: Deprecate
const { getBMC } = require("../modules/grendel");
const { redfish_auth, redfish_logout } = require("../modules/redfish/auth");
const { dell_clearSel, sm_clearSel, hpe_clearSel } = require("../modules/redfish/clearSel");
const { dell_badRequestFix } = require("../modules/redfish/dell");
const { dell_resetBmc, sm_resetBmc, hpe_resetBmc } = require("../modules/redfish/resetBmc");
const { dell_resetNode, sm_resetNode, hpe_resetNode } = require("../modules/redfish/resetNode");
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/redfish" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/redfish/",
        availibleRoutes: routes,
    });
});
app.put("/v1/clearSel/:node", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const node = req.params.node.split(",");
    let response = yield Promise.all(node.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        let bmc = yield getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = yield redfish_auth(uri);
            if (auth.status === "success") {
                if (auth.oem === "Dell")
                    api_res = yield dell_clearSel(uri, auth.token);
                else if (auth.oem === "Supermicro")
                    api_res = yield sm_clearSel(uri, auth.token);
                else if (auth.oem === "HPE")
                    api_res = yield hpe_clearSel(uri, auth.token);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                yield redfish_logout(auth.location, uri, auth.token);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    })));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully cleared SEL on ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
}));
app.put("/v1/resetBmc/:node", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const node = req.params.node.split(",");
    let response = yield Promise.all(node.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        let bmc = yield getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = yield redfish_auth(uri);
            if (auth.status === "success") {
                if (auth.oem === "Dell")
                    api_res = yield dell_resetBmc(uri, auth.token);
                else if (auth.oem === "Supermicro")
                    api_res = yield sm_resetBmc(uri, auth.token);
                else if (auth.oem === "HPE")
                    api_res = yield hpe_resetBmc(uri, auth.token);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                yield redfish_logout(auth.location, uri, auth.token);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    })));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully reset the BMC on ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
}));
app.put("/v1/resetNode/:nodes/:pxe?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const nodes = req.params.nodes.split(",");
    const pxe = (_j = req.params.pxe) !== null && _j !== void 0 ? _j : "false";
    let response = yield Promise.all(nodes.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        let bmc = yield getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = yield redfish_auth(uri);
            if (auth.status === "success") {
                if (auth.oem === "Dell")
                    api_res = yield dell_resetNode(uri, auth.token, pxe);
                else if (auth.oem === "Supermicro")
                    api_res = yield sm_resetNode(uri, auth.token, pxe);
                else if (auth.oem === "HPE")
                    api_res = yield hpe_resetNode(uri, auth.token, pxe);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                yield redfish_logout(auth.location, uri, auth.token);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    })));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully power cycled ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
}));
app.put("/v1/badReqFix/:nodes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nodes = req.params.nodes.split(",");
    let response = yield Promise.all(nodes.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        let bmc = yield getBMC(val);
        console.log(nodes, bmc);
        if (bmc.status === "success") {
            const uri = `https://${bmc.ip}`; // use IP since DNS won't resolve
            let auth = yield redfish_auth(uri);
            if (auth.status === "success") {
                if (auth.oem === "Dell")
                    api_res = yield dell_badRequestFix(uri, auth, bmc.address);
                else if (auth.oem === "Supermicro")
                    api_res = { status: "error", message: "Supermicro nodes are not supported" };
                else if (auth.oem === "HPE")
                    api_res = { status: "error", message: "HP nodes are not supported" };
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                yield redfish_logout(auth.location, uri, auth.token);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    })));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully applied Bad Reqest fix for ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
}));
module.exports = app;
