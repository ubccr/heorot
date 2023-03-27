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
Object.defineProperty(exports, "__esModule", { value: true });
const redfish_1 = require("../redfish");
function dell_redfish(auth) {
    var _j, _q;
    return __awaiter(this, void 0, void 0, function* () {
        let API_response = yield Promise.all([
            System_info(auth),
            BMC_info(auth),
            Network_devices(auth),
            Memory_info(auth),
            Processor_info(auth),
            PCI_devices(auth),
            SEL(auth),
            Storage_info(auth),
        ]);
        for (const response of API_response) {
            if (response.success === false)
                return response;
        }
        return Object.assign(Object.assign({ success: true }, API_response[0].data), { bmc: API_response[1].data, network: API_response[2].data, memory: API_response[3].data, processor: API_response[4].data, pcie: (_j = API_response[5].data) === null || _j === void 0 ? void 0 : _j.pcie, gpus: (_q = API_response[5].data) === null || _q === void 0 ? void 0 : _q.gpus, sel: API_response[6].data, storage: API_response[7].data });
    });
}
exports.default = dell_redfish;
function System_info(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            const systems_res = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1", auth);
            if (!systems_res.data)
                throw systems_res.info;
            let boot_info = [];
            if (systems_res.data.Boot.BootOptions !== undefined) {
                const boot_option_urls = yield (0, redfish_1.api_request)(systems_res.data.Boot.BootOptions["@odata.id"], auth);
                if (!boot_option_urls.data)
                    throw boot_option_urls.info;
                const boot_options = yield Promise.all(boot_option_urls.data.Members.map((url) => (0, redfish_1.api_request)(url["@odata.id"], auth)));
                boot_options.forEach((option) => {
                    if (option.data) {
                        boot_info.push({
                            id: option.data.Id,
                            name: option.data.DisplayName,
                            type: option.data.Name,
                            enabled: option.data.BootOptionEnabled,
                        });
                    }
                });
            }
            output = {
                success: true,
                data: {
                    model: systems_res.data.Model,
                    manufacturer: systems_res.data.Manufacturer,
                    service_tag: systems_res.data.SKU,
                    bios_version: systems_res.data.BiosVersion,
                    boot_info,
                    hostname: systems_res.data.HostName,
                    power_state: systems_res.data.PowerState,
                },
            };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get System info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function BMC_info(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            const managers_res = yield (0, redfish_1.api_request)("/redfish/v1/Managers/iDRAC.Embedded.1/", auth);
            if (!managers_res.data)
                throw managers_res.info;
            const managers_interfaces_res = yield (0, redfish_1.api_request)(managers_res.data.EthernetInterfaces["@odata.id"], auth);
            if (!managers_interfaces_res.data)
                throw managers_interfaces_res.info;
            const managers_nic_res = yield (0, redfish_1.api_request)(managers_interfaces_res.data.Members[0]["@odata.id"], auth);
            if (!managers_nic_res.data)
                throw managers_nic_res.info;
            output = {
                success: true,
                data: {
                    status: managers_res.data.Status.Health,
                    version: managers_res.data.FirmwareVersion,
                    mac: managers_nic_res.data.MACAddress,
                    vlan: managers_nic_res.data.VLAN.VLANId,
                    ip: managers_nic_res.data.IPv4Addresses[0].Address,
                    type: managers_nic_res.data.IPv4Addresses[0].AddressOrigin,
                    gateway: managers_nic_res.data.IPv4Addresses[0].Gateway,
                    subnet_mask: managers_nic_res.data.IPv4Addresses[0].SubnetMask,
                    dns: managers_nic_res.data.NameServers,
                },
            };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get BMC info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function Network_devices(auth) {
    var _j;
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            // Get network adapter list
            const interface_urls = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1/NetworkInterfaces/", auth);
            if (!interface_urls.data)
                throw interface_urls.info;
            const network_interfaces = yield Promise.all(interface_urls.data.Members.map((interface_url) => (0, redfish_1.api_request)(interface_url["@odata.id"], auth)));
            const network_port_urls = yield Promise.all(network_interfaces.map((network_interface) => {
                if (network_interface.data)
                    return (0, redfish_1.api_request)(network_interface.data.NetworkPorts["@odata.id"], auth);
                else
                    return {
                        success: false,
                        info: { message: "Failed to get network port urls from the node.", error: network_interface },
                    };
            }));
            let data = [];
            for (const network_port of network_port_urls) {
                if (!network_port.data)
                    continue;
                const interface_ports_res = yield Promise.all(network_port.data.Members.map((port_url) => (0, redfish_1.api_request)(port_url["@odata.id"], auth)));
                let adapter = {
                    adapter: network_port.data["@odata.id"].split("/")[6],
                    ports: [],
                };
                for (const network_port of interface_ports_res) {
                    if (!network_port.data)
                        continue;
                    adapter.ports.push({
                        status: (_j = network_port.data.Status.Health) !== null && _j !== void 0 ? _j : "Unknown",
                        link: network_port.data.LinkStatus,
                        id: network_port.data.Id,
                        type: network_port.data.ActiveLinkTechnology,
                        mac: network_port.data.AssociatedNetworkAddresses[0],
                        speed: network_port.data.SupportedLinkCapabilities[0].LinkSpeedMbps,
                        port: network_port.data.PhysicalPortNumber,
                    });
                }
                data.push(adapter);
            }
            output = { success: true, data };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get Network info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function PCI_devices(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            let systems = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1", auth);
            if (!systems.data)
                throw systems;
            if (systems.data.PCIeDevices === undefined)
                throw "PCIe devices object not found at expected endpoint!";
            let PCI_urls = systems.data.PCIeDevices.map((val) => val["@odata.id"]);
            let PCI_devices = yield Promise.all(PCI_urls.map((url) => (0, redfish_1.api_request)(url, auth)));
            let gpus_res = PCI_devices.filter((val) => {
                var _j, _q;
                return ((_j = val.data) === null || _j === void 0 ? void 0 : _j.Manufacturer) === "NVIDIA Corporation" ||
                    ((_q = val.data) === null || _q === void 0 ? void 0 : _q.Manufacturer) === "Advanced Micro Devices, Inc. [AMD/ATI]";
            });
            let ib_cards_res = PCI_devices.filter((val) => { var _j, _q, _10; return ((_j = val.data) === null || _j === void 0 ? void 0 : _j.Manufacturer) === "Mellanox Technologies" || ((_10 = (_q = val.data) === null || _q === void 0 ? void 0 : _q.Name) === null || _10 === void 0 ? void 0 : _10.match(/Omni-Path/g)); });
            let gpus = [];
            gpus_res.forEach((val) => {
                if (val.data)
                    gpus.push({
                        status: val.data.Status.Health,
                        manufacturer: val.data.Manufacturer,
                        model: val.data.Name,
                    });
            });
            let pcie = [];
            ib_cards_res.forEach((val) => {
                if (val.data)
                    pcie.push({
                        status: val.data.Status.Health,
                        manufacturer: val.data.Manufacturer,
                        model: val.data.Name,
                    });
            });
            output = { success: true, data: { gpus, pcie } };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get PCIeDevices data from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function Memory_info(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            const systems_memory_res = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1/Memory", auth);
            if (!systems_memory_res.data)
                throw systems_memory_res.info;
            let systems_memory_dimms_res = yield Promise.all(systems_memory_res.data.Members.map((val) => (0, redfish_1.api_request)(val["@odata.id"], auth)));
            let dimms = [];
            systems_memory_dimms_res.forEach((val) => {
                var _j, _q, _10, _11, _12, _13;
                if (val.data)
                    dimms.push({
                        name: val.data.Name,
                        status: val.data.Status.Health,
                        speed_Mhz: val.data.OperatingSpeedMhz,
                        module_type: (_j = val.data.BaseModuleType) !== null && _j !== void 0 ? _j : "",
                        capacity_MiB: val.data.CapacityMiB,
                        error_correction: val.data.ErrorCorrection,
                        manufacturer: val.data.Manufacturer,
                        memory_type: (_q = val.data.MemoryType) !== null && _q !== void 0 ? _q : "",
                        memory_modes: val.data.OperatingMemoryModes,
                        volatile_size_MiB: (_10 = val.data.VolatileSizeMiB) !== null && _10 !== void 0 ? _10 : 0,
                        non_volatile_size_MiB: (_11 = val.data.NonVolatileSizeMiB) !== null && _11 !== void 0 ? _11 : 0,
                        write_endurance_percent: (_13 = (_12 = val.data.Oem) === null || _12 === void 0 ? void 0 : _12.Dell.DellMemory.RemainingRatedWriteEndurancePercent) !== null && _13 !== void 0 ? _13 : null,
                    });
            });
            // TODO: support returning Critical and Warning depending on status
            let status = dimms.some((val) => ["Critical", "Warning"].includes(val.status)) ? "Critical" : "OK";
            let total_size_MiB = 0;
            let total_NV_size_MiB = 0;
            let total_V_size_MiB = 0;
            dimms.forEach((val) => {
                total_size_MiB += val.capacity_MiB;
                total_NV_size_MiB += val.non_volatile_size_MiB;
                total_V_size_MiB += val.volatile_size_MiB;
            });
            let data = {
                status,
                total_size_MiB,
                total_NV_size_MiB,
                total_V_size_MiB,
                speed_MhZ: dimms[0].speed_Mhz,
                dimms,
            };
            output = { success: true, data };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get Memory info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function Processor_info(auth) {
    var _j, _q;
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            const systems_res = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1", auth);
            if (!systems_res.data)
                throw systems_res.info;
            const processors_list_res = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1/Processors", auth);
            if (!processors_list_res.data)
                throw processors_list_res.info;
            const processors_res = yield Promise.all(processors_list_res.data.Members.map((val) => (0, redfish_1.api_request)(val["@odata.id"], auth)));
            let processors = [];
            processors_res.forEach((val) => {
                if (val.data && val.data.ProcessorType === "CPU")
                    processors.push({
                        status: val.data.Status.Health,
                        architecture: val.data.ProcessorArchitecture,
                        manufacturer: val.data.Manufacturer,
                        max_frequency: val.data.MaxSpeedMHz,
                        model: val.data.Model,
                        operating_speed_MHz: val.data.OperatingSpeedMHz,
                        socket: val.data.Socket,
                        total_cores: val.data.TotalCores,
                        total_threads: val.data.TotalThreads,
                        turbo: val.data.TurboState,
                    });
            });
            let data = {
                status: systems_res.data.ProcessorSummary.Status.Health,
                model: systems_res.data.ProcessorSummary.Model,
                count: systems_res.data.ProcessorSummary.Count,
                physical_cores: (_j = systems_res.data.ProcessorSummary.CoreCount) !== null && _j !== void 0 ? _j : 0,
                logical_cores: (_q = systems_res.data.ProcessorSummary.LogicalProcessorCount) !== null && _q !== void 0 ? _q : 0,
                processors,
            };
            output = { success: true, data };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get Processor info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function SEL(auth) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            // Get correct uri for entries (older idracs are /logs/sel, newer are /LogServices/Sel/Entries)
            const sel_res = yield (0, redfish_1.api_request)("/redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel", auth);
            if (!sel_res.data)
                throw sel_res.info;
            // Get entries
            const entries_res = yield (0, redfish_1.api_request)(sel_res.data.Entries["@odata.id"], auth);
            if (!entries_res.data)
                throw entries_res.info;
            let log_arr = entries_res.data.Members.map((val) => {
                return {
                    created: val.Created,
                    message: val.Message,
                    severity: val.Severity,
                };
            });
            output = { success: true, data: { count: entries_res.data["Members@odata.count"], logs: log_arr } };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get SEL entries from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
function Storage_info(auth) {
    var _j, _q, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
    return __awaiter(this, void 0, void 0, function* () {
        let output = { success: false };
        try {
            const storage_urls_res = yield (0, redfish_1.api_request)("/redfish/v1/Systems/System.Embedded.1/Storage", auth);
            if (!storage_urls_res.data)
                throw storage_urls_res.info;
            const controller_res = yield Promise.all(storage_urls_res.data.Members.map((val) => (0, redfish_1.api_request)(val["@odata.id"], auth)));
            let data_res = [];
            for (const controller of controller_res) {
                if (!controller.data || controller.data["Drives@odata.count"] < 1)
                    continue;
                // get enclosure info (slot_count)
                let enclosure_url = controller.data.Links.Enclosures[0]["@odata.id"];
                let slot_count = 0;
                if (enclosure_url.match(/Enclosure.Internal/)) {
                    let enclosure_res = yield (0, redfish_1.api_request)(enclosure_url, auth);
                    if (((_q = (_j = enclosure_res.data) === null || _j === void 0 ? void 0 : _j.Oem) === null || _q === void 0 ? void 0 : _q.Dell.DellChassisEnclosure) !== undefined)
                        slot_count = (_13 = (_12 = (_11 = (_10 = enclosure_res.data) === null || _10 === void 0 ? void 0 : _10.Oem) === null || _11 === void 0 ? void 0 : _11.Dell.DellChassisEnclosure) === null || _12 === void 0 ? void 0 : _12.SlotCount) !== null && _13 !== void 0 ? _13 : 0;
                    else if (((_15 = (_14 = enclosure_res.data) === null || _14 === void 0 ? void 0 : _14.Oem) === null || _15 === void 0 ? void 0 : _15.Dell.DellEnclosure) !== undefined)
                        slot_count = (_19 = (_18 = (_17 = (_16 = enclosure_res.data) === null || _16 === void 0 ? void 0 : _16.Oem) === null || _17 === void 0 ? void 0 : _17.Dell.DellEnclosure) === null || _18 === void 0 ? void 0 : _18.SlotCount) !== null && _19 !== void 0 ? _19 : 0;
                }
                // get drives and volumes
                let drives_res = yield Promise.all(controller.data.Drives.map((drives_res) => (0, redfish_1.api_request)(drives_res["@odata.id"], auth)));
                if (!drives_res)
                    continue;
                let volume_urls = yield (0, redfish_1.api_request)(controller.data.Volumes["@odata.id"], auth);
                if (!volume_urls.data)
                    continue;
                let volumes_res = yield Promise.all(volume_urls.data.Members.map((val) => (0, redfish_1.api_request)(val["@odata.id"], auth)));
                let drives = [];
                drives_res.forEach((val) => {
                    var _j, _q, _10, _11;
                    if (val.data)
                        drives.push({
                            status: val.data.Status.Health,
                            slot: (_q = (_j = val.data.Oem) === null || _j === void 0 ? void 0 : _j.Dell.DellPhysicalDisk.Slot) !== null && _q !== void 0 ? _q : null,
                            capacity: val.data.CapacityBytes,
                            type: val.data.MediaType,
                            name: val.data.Name,
                            model: val.data.Model,
                            form_factor: (_11 = (_10 = val.data.Oem) === null || _10 === void 0 ? void 0 : _10.Dell.DellPhysicalDisk.DriveFormFactor) !== null && _11 !== void 0 ? _11 : null,
                            manufacturer: val.data.Manufacturer,
                            description: val.data.Description,
                            serial_number: val.data.SerialNumber,
                            protocol: val.data.Protocol,
                            capable_speed: val.data.CapableSpeedGbs,
                            rotation_speed: val.data.RotationSpeedRPM,
                            predicted_write_endurance: val.data.PredictedMediaLifeLeftPercent,
                            failure_predicted: val.data.FailurePredicted,
                            hotspare_type: val.data.HotspareType,
                        });
                });
                let volumes = [];
                volumes_res.forEach((val) => {
                    var _j;
                    if (val.data)
                        volumes.push({
                            name: val.data.Name,
                            description: val.data.Description,
                            status: val.data.Status.Health,
                            volume_type: val.data.VolumeType,
                            capacity: val.data.CapacityBytes,
                            raid_type: (_j = val.data.RAIDType) !== null && _j !== void 0 ? _j : null,
                        });
                });
                data_res.push({
                    name: controller.data.Name,
                    model: controller.data.StorageControllers[0].Model,
                    status: controller.data.Status.Health,
                    speed: controller.data.StorageControllers[0].SpeedGbps,
                    firmware: controller.data.StorageControllers[0].FirmwareVersion,
                    slot_count,
                    drives,
                    volumes,
                });
            }
            if (!data_res)
                throw data_res;
            const data = yield Promise.all(data_res);
            output = { success: true, data: data };
        }
        catch (error) {
            output = { success: false, info: { message: "Failed to get Storage info from the node.", error } };
        }
        finally {
            return output;
        }
    });
}
