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
function dell_resetNode(uri, token, pxe) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pxe === "true") {
            const pxe_url = uri + "/redfish/v1/Systems/System.Embedded.1";
            const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } });
            let pxe_res = yield api_request(pxe_url, token, "PATCH", false, pxe_body);
            if (pxe_res.data.status !== 200) {
                return {
                    status: "error",
                    message: "Error setting PXE boot override",
                };
            }
        }
        const reset_url = uri + "/redfish/v1/Systems/System.Embedded.1/Actions/ComputerSystem.Reset";
        const reset_body = JSON.stringify({ ResetType: "ForceRestart" });
        let reset_res = yield api_request(reset_url, token, "POST", false, reset_body);
        if (reset_res.data.status === 204) {
            return {
                status: "success",
                message: "Node rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error rebooting the Node",
            };
        }
    });
}
function sm_resetNode(uri, token, pxe) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pxe) {
            const pxe_url = uri + "/redfish/v1/Systems/1";
            const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } });
            let pxe_res = yield api_request(pxe_url, token, "PATCH", false, pxe_body);
            if (pxe_res.data.status !== 200) {
                return {
                    status: "error",
                    message: "Error setting PXE boot override",
                };
            }
        }
        const body = JSON.stringify({ ResetType: "ForceRestart" });
        const url = uri + "/redfish/v1/Systems/1/Actions/ComputerSystem.Reset";
        let res = yield api_request(url, token, "POST", false, body);
        if (res.data.status === 200) {
            return {
                status: "success",
                message: "Node rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error rebooting the Node",
            };
        }
    });
}
function hpe_resetNode(uri, token, pxe) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pxe) {
            const pxe_url = uri + "/redfish/v1/Systems/1";
            const pxe_body = JSON.stringify({ Boot: { BootSourceOverrideTarget: "Pxe" } });
            let pxe_res = yield api_request(pxe_url, token, "PATCH", false, pxe_body);
            if (pxe_res.data.status !== 200) {
                return {
                    status: "error",
                    message: "Error setting PXE boot override",
                };
            }
        }
        const body = JSON.stringify({ ResetType: "ForceRestart" });
        const url = uri + "/redfish/v1/Systems/1/Actions/ComputerSystem.Reset";
        let res = yield api_request(url, token, "POST", false, body);
        if (res.data.status === 200) {
            return {
                status: "success",
                message: "Node rebooting momentarily",
            };
        }
        else {
            return {
                status: "error",
                message: "Error rebooting the Node",
            };
        }
    });
}
module.exports = {
    dell_resetNode,
    sm_resetNode,
    hpe_resetNode,
};
