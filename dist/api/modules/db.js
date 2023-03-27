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
let config = require("../config");
const mongoose = require("mongoose");
const Settings = require("../models/Settings");
const { decrypt } = require("./encryption");
const { schedule_node_refresh } = require("./nodes");
mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`, config.db.options).then(() => {
    console.log("Successfully connected to DB");
});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error:"));
mongoose.set("strictQuery", true);
// Create Settings document if it does not exist
Settings.updateOne({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true }, function (error, result) {
    if (error)
        console.log(error);
    if (result.upsertedCount > 0)
        console.log("Settings document not found in DB, generating and inserting default settings");
});
function syncDBSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        Settings.findOne({}, { _id: 0, __v: 0 }, {}, (err, res) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                console.error(err);
            else {
                config.settings = res;
                config.settings.bmc.password = yield decrypt(res.bmc.password);
                config.settings.switches.password = yield decrypt(res.switches.password);
                config.settings.openmanage.password = yield decrypt(res.openmanage.password);
                config.settings.dell_warranty_api.id = yield decrypt(res.dell_warranty_api.id);
                config.settings.dell_warranty_api.secret = yield decrypt(res.dell_warranty_api.secret);
                schedule_node_refresh();
            }
        }));
    });
}
syncDBSettings();
module.exports = { syncDBSettings };
