import { api_request } from "../redfish.js";
export async function dell_resetBmc(uri, auth) {
    const body = JSON.stringify({ ResetType: "GracefulRestart" });
    const url = uri + "/redfish/v1/Managers/iDRAC.Embedded.1/Actions/Manager.Reset";
    let res = await api_request(url, auth, "POST", false, body);
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
}
export async function sm_resetBmc(uri, auth) {
    const body = JSON.stringify({ ResetType: "GracefulRestart" });
    const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset";
    let res = await api_request(url, auth, "POST", false, body);
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
}
export async function hpe_resetBmc(uri, auth) {
    const body = JSON.stringify({ Action: "Reset" });
    const url = uri + "/redfish/v1/Managers/1/Actions/Manager.Reset/";
    let res = await api_request(url, auth, "POST", false, body);
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
}
