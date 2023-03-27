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
function dell_resetBmc(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ ResetType: "GracefulRestart" });
        const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1/Actions/Manager.Reset";
        let res = yield api_request(url, token, "POST", false, body);
        if (res.data.status === 204) {
            return {
                status: "success",
                message: "BMC rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error resetting BMC",
            };
        }
    });
}
function sm_resetBmc(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ ResetType: "GracefulRestart" });
        const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset";
        let res = yield api_request(url, token, "POST", false, body);
        if (res.data.status === 200) {
            return {
                status: "success",
                message: "BMC rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error resetting BMC",
            };
        }
    });
}
function hpe_resetBmc(uri, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ Action: "Reset" });
        const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset/";
        let res = yield api_request(url, token, "POST", false, body);
        if (res.data.status === 200) {
            return {
                status: "success",
                message: "BMC rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error resetting BMC",
            };
        }
    });
}
module.exports = {
    dell_resetBmc,
    sm_resetBmc,
    hpe_resetBmc,
};
