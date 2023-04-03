import { User } from "../models/User.js";
import config from "../../config/config.js";
import jwt from "jsonwebtoken";
export default function auth(req, res, next) {
    if (config.environment === "dev") {
        return next();
    }
    else {
        let token = req.headers["x-access-token"];
        if (!token || typeof token === "object") {
            return res.status(403).send({ status: "error", message: "No auth token provided" });
        }
        jwt.verify(token, config.settings.jwt_secret, async (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    status: "error",
                    message: "Authorization failed. Please login again",
                });
            }
            let query = await User.findOne({ _id: decoded.id }).exec();
            if (query?.privileges !== "none") {
                req.userId = decoded.id;
                next();
            }
            else {
                return res.status(403).send({ status: "error", message: "Insufficient privileges" });
            }
        });
    }
}
