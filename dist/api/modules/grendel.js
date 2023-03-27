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
const { default: got } = require("got");
let config = require("../config");
function grendelRequest(path, method = "GET", body = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let response = {};
            switch (method) {
                case "GET":
                    response = yield got(`unix:${config.grendel.socket}:${path}`);
                    break;
                case "PUT":
                    response = yield got.put(`unix:${config.grendel.socket}:${path}`);
                    break;
                case "POST":
                    response = yield got.post(`unix:${config.grendel.socket}:${path}`, {
                        json: body,
                    });
                    break;
                case "DELETE":
                    response = yield got.delete(`unix:${config.grendel.socket}:${path}`);
                    break;
            }
            return { status: "success", result: JSON.parse(response.body), message: JSON.stringify(JSON.parse(response.body)) };
        }
        catch (err) {
            if (err.code === "ENOENT" && err.response === undefined) {
                return {
                    status: "error",
                    result: { message: "Grendel API connection failed" },
                    code: err.code,
                };
            }
            else if (err.code === "EACCES" && err.response === undefined) {
                return {
                    status: "error",
                    result: { message: "Grendel API socket permission error" },
                    code: err.code,
                };
            }
            else if (err.response !== undefined) {
                return {
                    status: "error",
                    result: JSON.parse(err.response.body),
                    message: JSON.stringify(JSON.parse(err.response.body)),
                    code: err.code,
                };
            }
            else {
                return {
                    status: "error",
                    result: err,
                    code: err.code,
                };
            }
        }
    });
}
function getBMC(node) {
    return __awaiter(this, void 0, void 0, function* () {
        let fqdn = "";
        let ip = "";
        let grendelRes = yield grendelRequest(`/v1/host/find/${node}`);
        if (grendelRes.result.length > 0) {
            let grendelNode = grendelRes.result[0];
            grendelNode.interfaces.forEach((element) => {
                if (element.bmc === true) {
                    fqdn = element.fqdn;
                    ip = element.ip.split("/")[0];
                }
            });
            return {
                status: grendelRes.status,
                address: fqdn,
                ip: ip,
                node: grendelNode,
            };
        }
        else {
            return {
                status: "error",
                message: `No hosts matching ${node} found`,
            };
        }
    });
}
module.exports = { grendelRequest, getBMC };
