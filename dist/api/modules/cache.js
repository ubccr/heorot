import { Cache } from "../models/Cache.js";
export const setCache = async (node, data) => {
    return await Cache.findOneAndUpdate({ node: node }, { cache: data }, { new: true, upsert: true });
};
export const getCache = async (node) => {
    return await Cache.findOne({ node: node });
};
export const timeComp = (oldTime, offset = 1 * 24 * 60 * 60 * 1000) => {
    const past = new Date(oldTime);
    const now = new Date();
    const timeDiff = now.getTime() - past.getTime();
    if (timeDiff >= offset)
        return true;
    else
        return false;
};
