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
let config = require("../config");
const agent = new https.Agent({
    rejectUnauthorized: false,
});
function biosApi(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoded = Buffer.from(config.settings.bmc.username + ":" + config.settings.bmc.password).toString("base64");
        const auth = "Basic " + encoded;
        const header = {
            headers: {
                method: "GET",
                Authorization: auth,
                credentials: "include",
            },
            agent,
        };
        const api_url = "https://" + node + "/redfish/v1/Systems/System.Embedded.1/Bios";
        try {
            fetch_res = yield fetch(api_url, header);
            const json_res = yield fetch_res.json();
            if (json_res.Id === "Bios") {
                return {
                    message: "success",
                    Model: json_res.Attributes.SystemModelName,
                    BiosVersion: json_res.Attributes.SystemBiosVersion,
                    ServiceTag: json_res.Attributes.SystemServiceTag,
                    MemorySize: json_res.Attributes.SysMemSize,
                    CPU1: json_res.Attributes.Proc1Brand,
                    CPU2: json_res.Attributes.Proc2Brand,
                    BootOrder: json_res.Attributes.SetBootOrderEn,
                };
            }
            else {
                return {
                    status: "error",
                    message: "BIOS API error",
                    error: json_res.error["@Message.ExtendedInfo"][0].Message,
                };
            }
        }
        catch (error) {
            return {
                status: "error",
                message: "BIOS API error",
                node: api_url,
                error: error,
            };
        }
    });
}
module.exports = {
    biosApi,
};
