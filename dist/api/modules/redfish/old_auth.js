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
let config = require("../../config");
const { decrypt } = require("../encryption");
const agent = new https.Agent({
    rejectUnauthorized: false,
});
function redfish_auth(uri) {
    var _j;
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                UserName: config.settings.bmc.username,
                Password: config.settings.bmc.password,
            }),
            agent,
            timeout: 25000,
        };
        const header = {
            agent,
            timeout: 25000,
        };
        const urls = [`${uri}/redfish/v1/SessionService/Sessions`, `${uri}/redfish/v1`];
        try {
            let res_promise = yield Promise.all([
                yield fetch_timeout(urls[0], payload),
                yield (yield fetch_timeout(urls[1], header)).json(),
            ]);
            let token = res_promise[0].headers.get("x-auth-token");
            let status = token !== null ? "success" : "error";
            let OEM = new String();
            const resOEM = (_j = res_promise[1].Oem) !== null && _j !== void 0 ? _j : { Dell: "" }; // Best Guess
            if (Object.keys(resOEM).length === 0 || resOEM.hasOwnProperty("Supermicro"))
                // pesky bugged out SM api
                OEM = "Supermicro";
            else if (resOEM.hasOwnProperty("Dell"))
                OEM = "Dell";
            else if (resOEM.hasOwnProperty("Hp"))
                OEM = "HPE";
            if (status === "success") {
                return {
                    status: status,
                    token: token,
                    location: res_promise[0].headers.get("location"),
                    version: res_promise[1].RedfishVersion,
                    oem: OEM,
                    uri: uri,
                };
            }
            else {
                let error = yield res_promise[0].json();
                return {
                    status: "error",
                    message: "Error authenticating to BMC",
                    error: error.error,
                };
            }
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                error,
            };
        }
    });
}
function redfish_logout(url, uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let logout_url = new String();
        // One of these vendors is not like the others... *cough* HPE
        if (url.slice(0, 1) === "/") {
            logout_url = uri + url;
        }
        else {
            logout_url = url;
        }
        let header = {
            method: "DELETE",
            headers: { "X-Auth-Token": token },
            timeout: 10000,
            agent,
        };
        return yield fetch_timeout(logout_url, header);
    });
}
function fetch_timeout(url, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { timeout = 12000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
    });
}
module.exports = {
    redfish_auth,
    redfish_logout,
};
