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
let config = require("../config");
const { decrypt } = require("./encryption");
function warrantyApiReq(serviceTag) {
    return __awaiter(this, void 0, void 0, function* () {
        let token = config.WARRANTY_API_TOKEN;
        let warrantyRes = yield warrantyAPI(serviceTag, token);
        if (warrantyRes.Fault && warrantyRes.Fault.faultcode === "401") {
            let authRes = yield authAPI();
            if (authRes.access_token) {
                config.WARRANTY_API_TOKEN = authRes.access_token;
                token = authRes.access_token;
            }
            warrantyRes = yield warrantyAPI(serviceTag, token);
        }
        return { status: "success", result: warrantyRes };
    });
}
function authAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://apigtwb2c.us.dell.com/auth/oauth/v2/token`;
        const clientId = config.settings.dell_warranty_api.id;
        const clientSecret = config.settings.dell_warranty_api.secret;
        let params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);
        params.append("grant_type", "client_credentials");
        let payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        };
        return yield (yield fetch(url, payload)).json();
    });
}
function warrantyAPI(serviceTag, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://apigtwb2c.us.dell.com/PROD/sbil/eapi/v5/asset-entitlements?servicetags=${serviceTag}`;
        let payload = {
            headers: {
                Authorization: "Bearer " + token,
                "content-type": "application/json",
            },
        };
        return yield (yield fetch(url, payload)).json();
    });
}
module.exports = { warrantyApiReq };
