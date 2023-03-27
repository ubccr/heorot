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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = require("path");
const auth = require("./modules/auth");
const app = (0, express_1.default)();
let config = require("./config");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const cert = {
    key: fs_1.default.readFileSync(config.keys.serverKey),
    cert: fs_1.default.readFileSync(config.keys.serverCert),
};
app.use(express_1.default.static(__dirname + "/build"));
app.use((0, cors_1.default)());
require("./modules/db");
app.get("/", function (_, res) {
    res.sendFile((0, path_1.resolve)(__dirname, "build", "index.html"));
});
// --- routes ---
const authRouter = require("./routes/auth.js");
app.use("/auth", authRouter);
const clientRouter = require("./routes/client.js");
app.use("/client", auth, clientRouter);
const redfishRouter = require("./routes/redfish.js");
app.use("/redfish", auth, redfishRouter);
const grendelRouter = require("./routes/grendel.js");
app.use("/grendel", auth, grendelRouter);
const openmanageRouter = require("./routes/openmanage.js");
app.use("/openmanage", auth, openmanageRouter);
const warrantyRouter = require("./routes/warranty.js");
app.use("/warranty", auth, warrantyRouter);
const switchesRouter = require("./routes/switches.js");
app.use("/switches", auth, switchesRouter);
app.get("/plugins", function (req, res) {
    var _j, _q, _10;
    return __awaiter(this, void 0, void 0, function* () {
        let warranty, ome, bmc = false;
        if (config.settings.dell_warranty_api.id !== "")
            warranty = true;
        if (config.settings.openmanage.address !== "")
            ome = true;
        if (config.settings.bmc.username !== "")
            bmc = true;
        let floorplan = config.settings.floorplan;
        res.json({
            status: "success",
            warranty,
            ome,
            bmc,
            floorplan,
            node_prefixes: (_q = (_j = config.settings.rack.prefix.find((val) => val.type === "node")) === null || _j === void 0 ? void 0 : _j.prefix) !== null && _q !== void 0 ? _q : [
                "cpn",
                "srv",
            ],
            version: (_10 = process.env.npm_package_version) !== null && _10 !== void 0 ? _10 : "1.4.1",
        });
    });
});
const HttpsServer = https_1.default.createServer(cert, app);
const io = new socket_io_1.Server(HttpsServer, {
    cors: { origin: config.origin },
});
io.on("connection", function (socket) {
    socket.on("auth", function (token) {
        jsonwebtoken_1.default.verify(token, config.settings.jwt_secret, (err) => {
            if (!err) {
                socket.emit("auth", "authenticated");
                socket.on("node", function (data) {
                    const username = data.split("-")[0] === "swe" ? config.settings.switches.username : config.settings.bmc.username;
                    const password = data.split("-")[0] === "swe" ? config.settings.switches.password : config.settings.bmc.password;
                    const privateKey = data.split("-")[0] === "swe" ? fs_1.default.readFileSync(config.settings.switches.private_key_path) : undefined;
                    let SSHConnection = {
                        host: data,
                        port: 22,
                        username: username,
                        password: password,
                        privateKey: privateKey,
                        tryKeyboard: true,
                        algorithms: {
                            kex: [
                                "curve25519-sha256",
                                "curve25519-sha256@libssh.org",
                                "ecdh-sha2-nistp256",
                                "ecdh-sha2-nistp384",
                                "ecdh-sha2-nistp521",
                                "diffie-hellman-group-exchange-sha256",
                                "diffie-hellman-group14-sha256",
                                "diffie-hellman-group15-sha512",
                                "diffie-hellman-group16-sha512",
                                "diffie-hellman-group17-sha512",
                                "diffie-hellman-group18-sha512",
                                // older algos for HPE nodes
                                "diffie-hellman-group14-sha1",
                                "diffie-hellman-group1-sha1",
                            ],
                        },
                    };
                    var conn = new ssh2_1.Client();
                    conn
                        .on("ready", function () {
                        socket.emit("clear", true);
                        socket.emit("data", "\r\n Connected to SSH Session: \r\n \r\n");
                        conn.shell(function (err, stream) {
                            if (err)
                                return socket.emit("data", "\r\n SSH2 SHELL ERROR: " + err.message + " \r\n");
                            socket
                                .on("data", function (data) {
                                stream.write(data);
                            })
                                .on("disconnecting", function (e) {
                                // Handle client disconnecting
                                conn.end();
                            });
                            stream
                                .on("data", function (data) {
                                socket.emit("data", data.toString("binary"));
                            })
                                .on("close", function () {
                                conn.end();
                            });
                        });
                    })
                        .on("keyboard-interactive", function (name, instr, lang, prompts, cb) {
                        if (prompts[0].prompt === "Password: ")
                            cb([config.settings.bmc.password]);
                    })
                        .on("close", function () {
                        socket.emit("data", "\r\n Disconnected from SSH Session \r\n");
                    })
                        .on("error", function (err) {
                        socket.emit("data", "\r\n SSH2 CONNECTION ERROR: " + err.message + " \r\n");
                    })
                        .connect(SSHConnection);
                });
            }
            else {
                socket.emit("auth", "Authentication failed");
                socket.disconnect();
            }
        });
    });
});
HttpsServer.listen(config.port);
