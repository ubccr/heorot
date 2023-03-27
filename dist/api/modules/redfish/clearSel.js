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
const { api_request } = require("./redfish");
const body = JSON.stringify({ Action: "ClearLog" });
function dell_clearSel(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Actions/LogService.ClearLog";
        try {
            let res = yield api_request(url, token, "POST", false, body);
            return {
                status: res.status,
                message: "System Event Log successfully cleared",
            };
        }
        catch (error) {
            return {
                status: "error",
                message: "Error clearing SEL",
                error,
            };
        }
    });
}
function sm_clearSel(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = uri + "/redfish/v1/Systems/1/LogServices/Log1/Actions/LogService.ClearLog";
        try {
            let res = yield api_request(url, token, "POST", false, body);
            return {
                status: res.status,
                message: "System Event Log successfully cleared",
            };
        }
        catch (error) {
            return {
                status: "error",
                message: "Error clearing SEL",
                error,
            };
        }
    });
}
function hpe_clearSel(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = uri + "/redfish/v1/Systems/1/LogServices/IML/Actions/LogService.ClearLog/";
        try {
            let res = yield api_request(url, token, "POST", false, body);
            return {
                status: res.status,
                message: "System Event Log successfully cleared",
            };
        }
        catch (error) {
            return {
                status: "error",
                message: "Error clearing SEL",
                error,
            };
        }
    });
}
module.exports = {
    dell_clearSel,
    sm_clearSel,
    hpe_clearSel,
};
