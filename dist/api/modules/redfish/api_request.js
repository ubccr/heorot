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
const agent = new https.Agent({
    rejectUnauthorized: false,
});
function api_request(url, auth, method = "GET", json = true, body = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let header = {
                method: method,
                headers: { "X-Auth-Token": auth.token, "content-type": "application/json" },
                body,
                agent,
            };
            let res = new Object();
            if (typeof url === "string") {
                // Single request
                let res_promise = yield fetch(auth.uri + url, header);
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
                    const res = yield fetch(auth.uri + u, header);
                    if (json === true && res.status === 200)
                        return yield res.json();
                    else
                        return res;
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
module.exports = { api_request };
