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
const jwt = require("jsonwebtoken");
let config = require("../config");
const User = require("../models/User");
function auth(req, res, next) {
    if (config.environment === "dev") {
        return next();
    }
    else {
        let token = req.headers["x-access-token"];
        if (!token) {
            return res.status(403).send({ status: "error", message: "No auth token provided" });
        }
        jwt.verify(token, config.settings.jwt_secret, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                return res.status(401).send({
                    status: "error",
                    message: "Authorization failed. Please login again",
                });
            }
            let query = yield User.findOne({ _id: decoded.id }).exec();
            if (query.privileges !== "none") {
                req.userId = decoded.id;
                next();
            }
            else {
                return res.status(403).send({ status: "error", message: "Insufficient privileges" });
            }
        }));
    }
}
module.exports = auth;
