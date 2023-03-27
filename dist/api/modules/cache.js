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
const Cache = require("../models/Cache");
const setCache = (node, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Cache.findOneAndUpdate({ node: node }, { cache: data }, { new: true, upsert: true });
});
const getCache = (node) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Cache.findOne({ node: node });
});
const timeComp = (oldTime, offset = 1 * 24 * 60 * 60 * 1000) => {
    const past = new Date(oldTime);
    const now = new Date();
    const timeDiff = now.getTime() - past.getTime();
    if (timeDiff >= offset)
        return true;
    else
        return false;
};
module.exports = { setCache, getCache, timeComp };
