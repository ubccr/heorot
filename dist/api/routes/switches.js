import { getCache, setCache, timeComp } from "../modules/cache.js";
import { Switches } from "../models/Switches.js";
import express from "express";
import { getSwInfoV2 } from "../modules/switches.js";
import { grendelRequest } from "../modules/grendel.js";
const app = express.Router();
app.get("/", (req, res) => {
    let routes = [];
    app.stack.forEach((element) => {
        routes.push("/switches" + element.route.path);
    });
    res.json({
        status: "success",
        currentRoute: "/switches/",
        availibleRoutes: routes,
    });
});
app.get("/v1/query/:node/:refetch?", async (req, res) => {
    const node = req.params.node;
    const refetch = req.params.refetch;
    let getCacheRes = await getCache(node);
    if (getCacheRes !== null && refetch !== "true" && getCacheRes.cache.status !== "error") {
        if (timeComp(getCacheRes.updatedAt))
            getSw(node);
        res.json(getCacheRes.cache);
    }
    else {
        let resSw = await getSw(node);
        res.json(resSw);
    }
});
const getSw = async (node) => {
    let res = await getSwInfoV2(node);
    let setCacheRes = await setCache(node, res);
    // New switches DB collection
    if (res.status === "success") {
        // TODO: modify switch queries to match DB name scheme
        let data = {
            node: node,
            interfaces: res.result[1].output,
            mac_address_table: res.result[2].output,
            system: {
                model: res.result[0].output.model ?? "",
                uptime: res.result[0].output.uptime ?? "",
                version: res.result[0].output.version ?? "",
                vendor: res.result[0].output.vendor ?? "",
                service_tag: res.result[0].output.serviceTag ?? "",
            },
            info: {
                total_oversubscription: res.info.totalOversubscription,
                active_oversubscription: res.info.activeOversubscription,
                total_ports: res.info.totalPorts,
                active_ports: res.info.activePorts,
                fastest_port: res.info.fastestPort,
                uplink_count: res.info.uplinkCount,
                uplink_speed: res.info.uplinkSpeed,
                uplinks: res.info.uplinks,
            },
        };
        // TODO: error handling
        await Switches.findOneAndUpdate({ node: node }, data, { new: true, upsert: true });
    }
    return res;
};
app.get("/v1/refetchAll", async (req, res) => {
    let grendelRes = await grendelRequest(`/v1/host/tags/switch`);
    if (grendelRes.status === "success") {
        let output = await Promise.all(grendelRes.result.map(async (val) => await getSw(val.name)));
        let failed = output
            .map((val) => {
            if (val.status !== "success")
                return val.message;
        })
            .filter(Boolean);
        let status = failed.length > output.length ? "error" : "success";
        let message = `Successfully updated ${output.length} switches, Failed to update ${failed.length} switches`;
        res.json({ status, message, result: output, failed });
    }
    else
        res.json(grendelRes);
});
// app.get("/v1/allSwitches", async (req, res) => {
//   let switchesQuery = await Cache.find({ node: /^swe/ })
//   if (switchesQuery !== null) {
//     let tmp = switchesQuery
//       .map((val) => {
//         if (val.cache.status !== "error")
//           return { node: val.node, status: val.cache.status, info: val.cache.info, result: val.cache.result[0] }
//       })
//       .filter(Boolean)
//     res.json({ status: "success", result: tmp })
//   } else res.json({ status: "error", message: "Failed to load cached switches from the DB", silent: true })
// })
export default app;
