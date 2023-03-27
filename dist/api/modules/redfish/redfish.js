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
const fetch = require("node-fetch");
const https = require("https");
const { redfish_auth, redfish_logout } = require("./auth");
const { dell_query } = require("./dell");
const { getBMC } = require("../grendel");
const agent = new https.Agent({
    rejectUnauthorized: false,
});
function api_request(url, token, method = "GET", json = true, body = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let header = {
                method: method,
                headers: { "X-Auth-Token": token, "content-type": "application/json" },
                body,
                agent,
            };
            let res = new Object();
            if (typeof url === "string") {
                // Single request
                let res_promise = yield fetch(url, header);
                if (json === true)
                    res = yield res_promise.json();
                else
                    res = res_promise;
                if (res.hasOwnProperty("error"))
                    throw res.error;
            }
            else if (typeof url === "object") {
                // Parallel requests
                res = yield Promise.all(url.map((u) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield fetch(u, header);
                    return res.json();
                })));
            }
            return { status: "success", data: res };
        }
        catch (error) {
            return {
                status: "error",
                message: "Redfish API Request error",
                error,
            };
        }
    });
}
const redfishRequest = (node) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    let bmc = yield getBMC(node);
    if (bmc.status !== "success")
        return bmc;
    let url = `https://${bmc.address}`;
    let auth = yield redfish_auth(url); // authenticate to BMC and collect info
    if (auth.status !== "success")
        return auth;
    let output = { status: "error", message: "default redfishRequest object" };
    if (auth.oem === "Dell") {
        output = yield dell_query(auth);
    }
    else if (auth.oem === "Supermicro") {
        output = { status: "error", message: "Supermicro nodes are not supported yet", silent: true };
    }
    else if (auth.oem === "HPE") {
        output = { status: "error", message: "HPE nodes are not supported yet", silent: true };
    }
    else
        return { status: "error", message: "Failed to parse OEM from Redfish request" };
    let logout_res = yield redfish_logout(auth.location, url, auth.token);
    if (logout_res.status !== 200) {
        try {
            let error = (_j = (yield logout_res.json())) !== null && _j !== void 0 ? _j : logout_res;
            let extended = error.error["@Message.ExtendedInfo"] !== undefined ? error.error["@Message.ExtendedInfo"] : "";
            console.error(`Failed to logout of ${node}'s bmc`, error, extended); // Catch logout errors
        }
        catch (e) {
            console.log("Error at logout_res", e, logout_res);
        }
    }
    return output;
});
module.exports = {
    api_request,
    redfishRequest,
};
