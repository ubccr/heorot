"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cacheSchema = new Schema({
    node: { type: String, required: true, unique: true },
    cache: { type: Object, required: true },
}, { timestamps: true });
const Cache = mongoose.model("Cache", cacheSchema);
module.exports = Cache;
