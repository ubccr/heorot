import { redfish_auth, redfish_logout } from "./redfish/auth.js";
import fetch from "node-fetch";
import { Agent } from "https";
import dell_redfish from "./redfish/dell.js";
import { getBMC } from "./grendel.js";
const agent = new Agent({
    rejectUnauthorized: false,
});
export async function api_request(url, auth, method = "GET", req_json = true, body = undefined) {
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
        let res = await fetch(auth.uri + url, options);
        let json = await res.json();
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
}
export const redfishRequest = async (node) => {
    let bmc = await getBMC(node);
    if (bmc.status !== "success")
        return bmc;
    let url = `https://${bmc.address}`;
    let auth = await redfish_auth(url); // authenticate to BMC and collect info
    if (auth.status !== "success")
        return auth;
    try {
        let output = await dell_redfish(auth);
        return output;
    }
    catch (error) {
        console.log("Error in redfishRequest: ", error);
    }
    finally {
        let res_logout = await redfish_logout(url, auth);
        if (res_logout.status === "error")
            console.error(`Failed to logout of ${node}`, res_logout);
    }
};
function redfish_error_handler(data, auth) {
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
