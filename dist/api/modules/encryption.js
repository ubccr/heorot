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
const crypto = require("crypto");
const config = require("../config");
const Settings = require("../models/Settings");
const algorithm = "aes-256-cbc";
const key = Buffer.from(config.key, "hex");
function encrypt(text) {
    return __awaiter(this, void 0, void 0, function* () {
        let db_res = yield Settings.findOne({}, { jwt_secret: 1, _id: 0 });
        const iv = Buffer.from(db_res.jwt_secret, "hex");
        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString("hex");
    });
}
function decrypt(text) {
    return __awaiter(this, void 0, void 0, function* () {
        if (text === "")
            return text;
        let db_res = yield Settings.findOne({}, { jwt_secret: 1, _id: 0 });
        const iv = Buffer.from(db_res.jwt_secret, "hex");
        let encryptedText = Buffer.from(text, "hex");
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    });
}
module.exports = { encrypt, decrypt };
