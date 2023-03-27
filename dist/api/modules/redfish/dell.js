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
const { formatBytes } = require("../math");
const { api_request } = require("./api_request");
// TODO: Needs a rewrite with proper error handling
const dell_query = (auth) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _q, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35;
    let urls = [
        "/redfish/v1/Systems/System.Embedded.1",
        "/redfish/v1/Systems/System.Embedded.1/Bios",
        "/redfish/v1/Managers/iDRAC.Embedded.1",
        "/redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces",
        "/redfish/v1/Systems/System.Embedded.1/Processors",
        "/redfish/v1/Systems/System.Embedded.1/Storage",
        "/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel",
        "/redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/",
    ];
    let query_res = yield api_request(urls, auth);
    if ((query_res === null || query_res === void 0 ? void 0 : query_res.status) === "error")
        return query_res;
    let systems = query_res.data[0];
    let s_bios = (_j = query_res.data[1]) === null || _j === void 0 ? void 0 : _j.Attributes;
    let managers = query_res.data[2];
    let sel = query_res.data[6];
    let cpu_urls = (_q = query_res.data[4]) === null || _q === void 0 ? void 0 : _q.Members.map((val) => val["@odata.id"]).filter((val) => val.match(/CPU/));
    let gpu_urls = (_10 = query_res.data[4]) === null || _10 === void 0 ? void 0 : _10.Members.map((val) => val["@odata.id"]).filter((val) => val.match(/Video/));
    let storage_urls = (_12 = (_11 = query_res.data[5]) === null || _11 === void 0 ? void 0 : _11.Members) === null || _12 === void 0 ? void 0 : _12.map((val) => val["@odata.id"]);
    let s_volume_urls = (_14 = (_13 = query_res.data[5]) === null || _13 === void 0 ? void 0 : _13.Members) === null || _14 === void 0 ? void 0 : _14.map((val) => val["@odata.id"] + "/Volumes");
    let pci_urls = (_16 = (_15 = systems === null || systems === void 0 ? void 0 : systems.PCIeDevices) === null || _15 === void 0 ? void 0 : _15.map((val) => val["@odata.id"])) !== null && _16 !== void 0 ? _16 : [];
    let network_urls = (_18 = (_17 = query_res.data[7]) === null || _17 === void 0 ? void 0 : _17.Members) === null || _18 === void 0 ? void 0 : _18.map((val) => val["@odata.id"] + "/NetworkPorts");
    // second query
    let query_res_2 = yield Promise.all([
        yield api_request((_20 = (_19 = query_res.data[3]) === null || _19 === void 0 ? void 0 : _19.Members) === null || _20 === void 0 ? void 0 : _20[0]["@odata.id"], auth),
        yield api_request(cpu_urls, auth),
        yield api_request(gpu_urls, auth),
        yield api_request(storage_urls, auth),
        yield api_request(s_volume_urls, auth),
        yield api_request(pci_urls, auth),
        yield api_request(network_urls, auth),
    ]);
    let pci_devices = (_21 = query_res_2[5].data) !== null && _21 !== void 0 ? _21 : [];
    let bmc = (_22 = query_res_2[0]) === null || _22 === void 0 ? void 0 : _22.data;
    let cpu = (_23 = query_res_2[1]) === null || _23 === void 0 ? void 0 : _23.data;
    let hdd = ((_24 = query_res_2[3]) === null || _24 === void 0 ? void 0 : _24.data.length) !== undefined ? (_25 = query_res_2[3]) === null || _25 === void 0 ? void 0 : _25.data : [];
    let gpu = ((_26 = query_res_2[2]) === null || _26 === void 0 ? void 0 : _26.data.length) > 0
        ? (_27 = query_res_2[2]) === null || _27 === void 0 ? void 0 : _27.data
        : pci_devices.filter((val) => { var _j; return (_j = ["NVIDIA Corporation"]) === null || _j === void 0 ? void 0 : _j.includes(val === null || val === void 0 ? void 0 : val.Manufacturer); }); // add AMD?
    let storage = (_28 = hdd.find((val) => { var _j; return ((_j = val.Drives) === null || _j === void 0 ? void 0 : _j.length) > 0; })) !== null && _28 !== void 0 ? _28 : [];
    let ib = pci_devices.filter((val) => { var _j; return ["Mellanox Technologies"].includes(val.Manufacturer) || ((_j = val.Description) === null || _j === void 0 ? void 0 : _j.match(/Omni/g)); }); // find Mellanox IB & Omni path cards
    let network_port_urls = [];
    if (query_res_2[6].data.length > 0)
        query_res_2[6].data.forEach((val) => val.Members.forEach((val2) => network_port_urls.push(val2["@odata.id"])));
    // third query
    let storage_link = (_29 = storage.Links) === null || _29 === void 0 ? void 0 : _29.Enclosures.find((val) => val["@odata.id"].match(/Enclosure/g));
    let enclosure_url = storage_link !== undefined ? storage_link["@odata.id"] : null;
    let drive_urls = (_30 = storage.Drives) === null || _30 === void 0 ? void 0 : _30.map((val) => val["@odata.id"]);
    let volume_urls = [];
    let vol = query_res_2[4].data.length !== undefined ? query_res_2[4].data : [];
    vol.forEach((val) => {
        if (val["Members@odata.count"] > 0)
            val.Members.forEach((vol) => volume_urls.push(vol["@odata.id"]));
    });
    let query_res_3 = yield Promise.all([
        yield api_request(enclosure_url, auth),
        yield api_request(drive_urls, auth),
        yield api_request((_32 = (_31 = storage === null || storage === void 0 ? void 0 : storage.Volumes) === null || _31 === void 0 ? void 0 : _31["@odata.id"]) !== null && _32 !== void 0 ? _32 : "", auth),
        yield api_request(volume_urls, auth),
        yield api_request(network_port_urls, auth),
    ]);
    // network ports
    let ports = query_res_3[4].data;
    // storage
    let drives = query_res_3[1].data;
    let volumes = query_res_3[3].data;
    let slotCount = 0;
    // fix for certain dell models with different object naming
    let tmp_oem = (_34 = (_33 = query_res_3[0].data) === null || _33 === void 0 ? void 0 : _33.Oem) === null || _34 === void 0 ? void 0 : _34.Dell;
    if (tmp_oem !== undefined && tmp_oem.DellChassisEnclosure !== undefined)
        slotCount = tmp_oem.DellChassisEnclosure.SlotCount;
    else if (tmp_oem !== undefined && tmp_oem.DellEnclosure !== undefined)
        slotCount = tmp_oem.DellEnclosure.SlotCount;
    // boot order
    let bootArr = systems.Boot.BootOrder === undefined ? null : systems.Boot.BootOrder.join(",");
    let boot_order = (s_bios === null || s_bios === void 0 ? void 0 : s_bios.SetBootOrderEn) !== undefined ? s_bios === null || s_bios === void 0 ? void 0 : s_bios.SetBootOrderEn : bootArr;
    // GPU
    let physical_gpu = 0;
    let virtual_gpu = 0;
    gpu.forEach((val) => {
        if (val.Id.slice(-2) === "-1" || val.Id.slice(-2) === "-0")
            physical_gpu++; // -0 is for older versions (~13th gen)
        else
            virtual_gpu++;
    });
    let response = {
        model: systems.Model,
        manufacturer: systems.Manufacturer,
        service_tag: systems.SKU,
        bios_version: systems.BiosVersion,
        boot_order: boot_order,
        hostname: systems.HostName,
        power_state: systems.PowerState,
        bmc: {
            status: managers.Status.Health,
            version: managers.FirmwareVersion,
            vlan: bmc.VLAN.VLANId,
            mac: bmc.MACAddress,
            addresses: {
                // assuming one IP address per bmc
                ip: bmc.IPv4Addresses[0].Address,
                type: bmc.IPv4Addresses[0].AddressOrigin,
                gateway: bmc.IPv4Addresses[0].Gateway,
                subnet_mask: bmc.IPv4Addresses[0].SubnetMask,
            },
            dns: bmc.NameServers.filter((val) => !["::", "0.0.0.0"].includes(val)), // filter out garbage DNS data
        },
        memory: {
            status: systems.MemorySummary.Status.Health,
            type: s_bios.SysMemType,
            size: s_bios.SysMemSize,
            speed: s_bios.SysMemSpeed,
        },
        network: ports === null || ports === void 0 ? void 0 : ports.map((val) => {
            var _j;
            return {
                status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                link: val.LinkStatus,
                id: val.Id,
                type: val.ActiveLinkTechnology,
                mac: val.AssociatedNetworkAddresses[0],
                speed: val.CurrentLinkSpeedMbps,
                port: val.PhysicalPortNumber,
            };
        }),
        pcie: ib.map((val) => {
            var _j;
            return {
                status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                manufacturer: val.Manufacturer,
                name: val.Name,
            };
        }),
        processor: cpu === null || cpu === void 0 ? void 0 : cpu.map((val) => {
            var _j, _q, _10;
            return {
                status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                model: val.Model,
                cores: val.TotalCores,
                turbo: (_q = val.TurboState) !== null && _q !== void 0 ? _q : s_bios.ProcTurboMode,
                threads: val.TotalThreads,
                max_frequency: val.MaxSpeedMHz,
                frequency: (_10 = val.OperatingSpeedMHz) !== null && _10 !== void 0 ? _10 : parseFloat(val.Model.match(/[0-9]\.[0-9]{2}/g)[0]) * 1000,
                logical_proc: val.TotalCores !== val.TotalThreads ? "Enabled" : "Disabled",
            };
        }),
        gpu: {
            vGPU: virtual_gpu === 0 ? false : true,
            physical: physical_gpu,
            virtual: virtual_gpu,
            gpus: gpu
                .map((val) => {
                var _j, _q;
                if (val.Id.slice(-2) === "-1" || val.Id.slice(-2) === "-0")
                    return {
                        status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                        manufacturer: val.Manufacturer,
                        model: (_q = val.Model) !== null && _q !== void 0 ? _q : val.Name,
                    };
            })
                .filter(Boolean),
        },
        storage: {
            controller: storage.Name,
            status: storage.Status.Health,
            drive_count: storage["Drives@odata.count"],
            slot_count: slotCount,
            volumes: volumes === null || volumes === void 0 ? void 0 : volumes.map((val) => {
                var _j, _q;
                if (!val.Name.match(/NonRAID/g))
                    return {
                        name: val.Name,
                        description: val.Description,
                        status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                        volume_type: val.VolumeType,
                        raid_type: (_q = val.RAIDType) !== null && _q !== void 0 ? _q : "",
                        capacity: formatBytes(val.CapacityBytes, 1),
                    };
            }).filter(Boolean),
            drives: drives.map((val) => {
                var _j, _q, _10, _11, _12, _13;
                return {
                    status: (_j = val.Status) === null || _j === void 0 ? void 0 : _j.Health,
                    slot: (_q = val.PhysicalLocation) === null || _q === void 0 ? void 0 : _q.PartLocation.LocationOrdinalValue,
                    capacity: formatBytes(val.CapacityBytes, 1),
                    type: val.MediaType,
                    name: val.Name,
                    model: val.Model,
                    form_factor: (_13 = (_12 = (_11 = (_10 = val.Oem) === null || _10 === void 0 ? void 0 : _10.Dell) === null || _11 === void 0 ? void 0 : _11.DellPhysicalDisk) === null || _12 === void 0 ? void 0 : _12.DriveFormFactor) !== null && _13 !== void 0 ? _13 : "",
                    manufacturer: val.Manufacturer,
                    description: val.Description,
                    serial_number: val.SerialNumber,
                    protocol: val.Protocol,
                    capable_speed: val.CapableSpeedGbs,
                    rotation_speed: val.RotationSpeedRPM,
                    predicted_write_endurance: val.PredictedMediaLifeLeftPercent,
                    failure_predicted: val.Failurepredicted,
                    hotspare_type: val.HotspareType,
                };
            }),
        },
        sel: {
            count: sel["Members@odata.count"],
            logs: (_35 = sel.Members) === null || _35 === void 0 ? void 0 : _35.map((val) => {
                return {
                    created: val.Created,
                    message: val.Message,
                    severity: val.Severity,
                };
            }),
        },
    };
    return response;
});
const dell_badRequestFix = (uri, auth, fqdn) => __awaiter(void 0, void 0, void 0, function* () {
    let idrac_name = fqdn.split(".")[0];
    let domain_name = fqdn.split(".").splice(1).join(".");
    const endpoint = "/redfish/v1/Managers/iDRAC.Embedded.1/Attributes";
    const body = JSON.stringify({
        Attributes: {
            "NIC.1.DNSDomainFromDHCP": "Disabled",
            "NIC.1.DNSDomainNameFromDHCP": "Disabled",
            "NIC.1.DNSDomainName": domain_name,
            "NIC.1.DNSRacName": idrac_name,
        },
    });
    let res = yield api_request(endpoint, auth, "PATCH", false, body);
    console.log(res);
    if (res.status === "success") {
        let res_json = yield res.data.json();
        res_json.status = res.status;
        if (res.data.status === 200)
            res_json.message = "Successfully modified iDRAC values";
        else
            res_json.message = "Error sending redfish request";
        return res_json;
    }
    else
        return res;
});
module.exports = {
    dell_query,
    dell_badRequestFix,
};
