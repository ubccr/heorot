import { dell_clearSel, hpe_clearSel, sm_clearSel } from "../modules/redfish/clearSel.js";
import { dell_resetBmc, hpe_resetBmc, sm_resetBmc } from "../modules/redfish/resetBmc.js";
import { dell_resetNode, hpe_resetNode, sm_resetNode } from "../modules/redfish/resetNode.js";
import { redfish_auth, redfish_logout } from "../modules/redfish/auth.js";
import dell_badRequestFix from "../modules/redfish/badReqFix.js";
import express from "express";
import { getBMC } from "../modules/grendel.js";
const app = express.Router();
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/redfish" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/redfish/",
        availibleRoutes: routes,
    });
});
app.put("/v1/clearSel/:node", async (req, res) => {
    const node = req.params.node.split(",");
    let response = await Promise.all(node.map(async (val) => {
        let bmc = await getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = await redfish_auth(uri);
            if (auth.status === "success") {
                let api_res = { status: "error", message: "" };
                if (auth.oem === "Dell")
                    api_res = await dell_clearSel(uri, auth);
                else if (auth.oem === "Supermicro")
                    api_res = await sm_clearSel(uri, auth);
                else if (auth.oem === "HPE")
                    api_res = await hpe_clearSel(uri, auth);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                await redfish_logout(uri, auth);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    }));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully cleared SEL on ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
});
app.put("/v1/resetBmc/:node", async (req, res) => {
    const node = req.params.node.split(",");
    let response = await Promise.all(node.map(async (val) => {
        let bmc = await getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = await redfish_auth(uri);
            if (auth.status === "success") {
                let api_res = { status: "error", message: "" };
                if (auth.oem === "Dell")
                    api_res = await dell_resetBmc(uri, auth);
                else if (auth.oem === "Supermicro")
                    api_res = await sm_resetBmc(uri, auth);
                else if (auth.oem === "HPE")
                    api_res = await hpe_resetBmc(uri, auth);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                await redfish_logout(uri, auth);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    }));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully reset the BMC on ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
});
app.put("/v1/resetNode/:nodes/:pxe?", async (req, res) => {
    const nodes = req.params.nodes.split(",");
    const pxe = req.params.pxe ?? "false";
    let response = await Promise.all(nodes.map(async (val) => {
        let bmc = await getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.address}`;
            let auth = await redfish_auth(uri);
            if (auth.status === "success") {
                let api_res = { status: "error", message: "" };
                if (auth.oem === "Dell")
                    api_res = await dell_resetNode(uri, auth, pxe);
                else if (auth.oem === "Supermicro")
                    api_res = await sm_resetNode(uri, auth, pxe);
                else if (auth.oem === "HPE")
                    api_res = await hpe_resetNode(uri, auth, pxe);
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                await redfish_logout(uri, auth);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    }));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully power cycled ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
});
app.put("/v1/badReqFix/:nodes", async (req, res) => {
    const nodes = req.params.nodes.split(",");
    let response = await Promise.all(nodes.map(async (val) => {
        let bmc = await getBMC(val);
        if (bmc.status === "success") {
            const uri = `https://${bmc.ip}`; // use IP since DNS won't resolve
            let auth = await redfish_auth(uri);
            if (auth.status === "success") {
                let api_res = { status: "error", message: "" };
                if (auth.oem === "Dell" && bmc.address) {
                    if (auth.version && parseInt(auth.version.split(".")[2]) <= 4)
                        api_res = { status: "error", message: "Dell iDRAC version is not supported" };
                    else
                        api_res = await dell_badRequestFix(bmc.address, auth);
                }
                else if (auth.oem === "Supermicro")
                    api_res = { status: "error", message: "Supermicro nodes are not supported" };
                else if (auth.oem === "HPE")
                    api_res = { status: "error", message: "HP nodes are not supported" };
                else
                    api_res = {
                        status: "error",
                        message: "failed to parse OEM from Redfish call",
                    };
                let logout_res = await redfish_logout(uri, auth);
                if (logout_res.status === "error")
                    console.error(`Failed to logout of bmc: ${bmc.node}`, logout_res);
                return api_res;
            }
            else
                return auth;
        }
        else
            return bmc;
    }));
    let errors = response.filter((val) => val.status === "error");
    let successes = response.filter((val) => val.status === "success");
    let status = "success";
    let message = "";
    if (response.length === 1)
        res.json(response[0]);
    else {
        if (successes.length >= 1)
            message += `Successfully applied Bad Reqest fix for ${successes.length} node(s). `;
        if (errors.length >= 1) {
            status = "error";
            message += `${errors.length} node(s) failed. (see browser console for details)`;
        }
        res.json({ status: status, message: message, error: errors });
    }
});
export default app;
