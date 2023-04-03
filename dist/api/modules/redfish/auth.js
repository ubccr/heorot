import config from "../../../config/config.js";
import fetch from "node-fetch";
import https from "https";
const agent = new https.Agent({
    rejectUnauthorized: false,
});
export async function redfish_auth(uri) {
    const payload = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            UserName: config.settings.bmc.username,
            Password: config.settings.bmc.password,
        }),
        agent,
        // timeout: 25000,
    };
    let output = {
        status: "error",
    };
    try {
        // initial query to obtain redfish info
        let res_redfish_info = await fetch(`${uri}/redfish/v1`, { agent });
        if (!res_redfish_info.ok)
            throw res_redfish_info;
        let redfish_info = await res_redfish_info.json();
        // query to login and get x-auth-token
        let res_redfish_login = await fetch(`${uri}/redfish/v1/SessionService/Sessions`, payload);
        if (!res_redfish_info.ok && res_redfish_info.status !== 405)
            throw res_redfish_login; // ignore 405 errors because of Dell 13th gen nodes (they complain if the method is not a patch, but it still works...)
        let token = res_redfish_login.headers.get("x-auth-token");
        if (token === null)
            throw await res_redfish_login.json();
        let location = res_redfish_login.headers.get("location");
        if (location === null)
            throw await res_redfish_login.json();
        let version = redfish_info.RedfishVersion;
        // code to ensure proper OEM detection
        let res_oem = redfish_info.Oem;
        if (res_oem === undefined)
            throw { extended_message: `Failed to determine vendor of Node. (${uri})`, redfish_info };
        let oem = "";
        if (res_oem.hasOwnProperty("Dell"))
            oem = "Dell";
        if (res_oem.hasOwnProperty("Hp"))
            oem = "HPE";
        if (res_oem.hasOwnProperty("Supermicro") || Object.keys(res_oem).length === 0)
            oem = "Supermicro"; // Most of our SM nodes have an empty oem object...
        output = {
            status: "success",
            token,
            location,
            version,
            oem,
            uri,
        };
    }
    catch (error) {
        output = {
            status: "error",
            message: "Error authenticating to BMC. (See browser console for details)",
            error: error,
        };
    }
    finally {
        return output;
    }
}
export async function redfish_logout(url, auth) {
    let output = {
        status: "error",
    };
    try {
        if (!auth.token || !auth.location)
            throw { extended_message: `Failed Redfish logout on ${url}, auth token or location is undefined!`, auth };
        let logout_url = auth.location.match(/^http/) ? auth.location : url + auth.location;
        const header = {
            method: "DELETE",
            headers: { "X-Auth-Token": auth.token },
            agent,
        };
        let res = await fetch(logout_url, header);
        output = { status: "success", code: res.status };
    }
    catch (error) {
        output = { status: "error", message: `Failed to logout of node. (${url}: See browser console for details.)`, error };
    }
    return output;
}
