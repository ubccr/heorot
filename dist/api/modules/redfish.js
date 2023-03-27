"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redfishRequest = exports.api_request = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const auth_1 = __importStar(require("./redfish/auth"));
const https_1 = require("https");
const dell2_1 = __importDefault(require("./redfish/dell2"));
const { getBMC } = require("./grendel");
const agent = new https_1.Agent({
    rejectUnauthorized: false,
});
function api_request(url, auth, method = "GET", req_json = true, body = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            if (auth.token === undefined)
                throw "Auth token cannot be undefined";
            let headers = {
                "X-Auth-Token": auth.token,
                "Content-Type": "application/json",
            };
            let options = {
                method,
                headers,
                body,
                agent,
            };
            let res = yield (0, node_fetch_1.default)(auth.uri + url, options);
            let json = yield res.json();
            if (!res.ok || res.status !== 200)
                return redfish_error_handler(json, auth);
            if (req_json === true)
                output = { success: true, data: json };
            else
                output = { success: true, data: res };
            return output;
        }
        catch (error) {
            return { success: false, info: { message: "API request failed!", error } };
        }
    });
}
exports.api_request = api_request;
const redfishRequest = (node) => __awaiter(void 0, void 0, void 0, function* () {
    let bmc = yield getBMC(node);
    if (bmc.status !== "success")
        return bmc;
    let url = `https://${bmc.address}`;
    let auth = yield (0, auth_1.default)(url); // authenticate to BMC and collect info
    if (auth.status !== "success")
        return auth;
    let output = yield (0, dell2_1.default)(auth);
    let res_logout = yield (0, auth_1.redfish_logout)(url, auth);
    if (res_logout.status === "error")
        console.error(`Failed to logout of ${node}`, res_logout);
    return output;
});
exports.redfishRequest = redfishRequest;
function redfish_error_handler(data, auth) {
    console.log(data);
    if (auth.oem === "Dell")
        return {
            success: false,
            info: {
                message: data.error["@Message.ExtendedInfo"][0].Message,
                error: data.error["@Message.ExtendedInfo"],
            },
        };
    else
        return { success: false, info: { message: "Redfish API call failed!", error: data.error } };
}
