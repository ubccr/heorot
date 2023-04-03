import { api_request } from "../redfish.js";
// TODO: migrate to new response format: {success: boolean}
const body = JSON.stringify({ Action: "ClearLog" });
export async function dell_clearSel(uri, auth) {
    const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Actions/LogService.ClearLog";
    try {
        let res = await api_request(url, auth, "POST", false, body);
        return {
            status: "success",
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
}
export async function sm_clearSel(uri, auth) {
    const url = uri + "/redfish/v1/Systems/1/LogServices/Log1/Actions/LogService.ClearLog";
    try {
        let res = await api_request(url, auth, "POST", false, body);
        return {
            status: "success",
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
}
export async function hpe_clearSel(uri, auth) {
    const url = uri + "/redfish/v1/Systems/1/LogServices/IML/Actions/LogService.ClearLog/";
    try {
        let res = await api_request(url, auth, "POST", false, body);
        return {
            status: "success",
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
}
