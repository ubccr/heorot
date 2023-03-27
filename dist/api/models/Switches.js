"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const switchesSchema = new Schema({
    node: { type: String, required: true, unique: true },
    interfaces: [
        {
            port: { type: String },
            description: { type: String },
            status: { type: String },
            speed: { type: String },
            type: { type: String },
            duplex: { type: String },
            vlan: { type: String },
        },
    ],
    mac_address_table: [
        {
            port: { type: String },
            mac: { type: String },
            type: { type: String },
            vlan: { type: String },
            state: { type: String },
        },
    ],
    system: {
        model: { type: String },
        uptime: { type: String },
        version: { type: String },
        vendor: { type: String },
        service_tag: { type: String },
    },
    info: {
        total_oversubscription: { type: String },
        active_oversubscription: { type: String },
        total_ports: { type: Number },
        active_ports: { type: Number },
        fastest_port: { type: Number },
        uplink_count: { type: Number },
        uplink_speed: { type: Number },
        uplinks: [
            {
                port: { type: String },
                description: { type: String },
                status: { type: String },
                speed: { type: String },
                duplex: { type: String },
                vlan: { type: String },
            },
        ],
    },
    notes: { type: String },
}, { timestamps: true });
const Switches = mongoose.model("Switches", switchesSchema);
module.exports = Switches;
