const express = require("express")
const app = express()
const cors = require("cors")

let config = require("./config")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const https = require("https")
const fs = require("fs")
const cert = {
  key: fs.readFileSync(config.keys.serverKey),
  cert: fs.readFileSync(config.keys.serverCert),
}
const jwt = require("jsonwebtoken")

app.use(express.static(__dirname + "/build"))

app.use(cors())
const auth = require("./modules/auth")

require("./modules/db")

app.get("/", function (req, res) {
  response.sendFile(path.resolve(__dirname, "build", "index.html"))
})

// --- routes ---
const authRouter = require("./routes/auth.js")
app.use("/auth", authRouter)

const clientRouter = require("./routes/client.js")
app.use("/client", auth, clientRouter)

const redfishRouter = require("./routes/redfish.js")
app.use("/redfish", auth, redfishRouter)

const grendelRouter = require("./routes/grendel.js")
app.use("/grendel", auth, grendelRouter)

const openmanageRouter = require("./routes/openmanage.js")
app.use("/openmanage", auth, openmanageRouter)

const warrantyRouter = require("./routes/warranty.js")
app.use("/warranty", auth, warrantyRouter)

const switchesRouter = require("./routes/switches.js")
app.use("/switches", auth, switchesRouter)

app.get("/plugins", async function (req, res) {
  let warranty,
    ome,
    bmc = false
  if (config.settings.dell_warranty_api.id !== "") warranty = true
  if (config.settings.openmanage.address !== "") ome = true
  if (config.settings.bmc.username !== "") bmc = true
  let floorplan = config.settings.floorplan

  res.json({
    status: "success",
    warranty,
    ome,
    bmc,
    floorplan,
    node_prefixes: config.settings.rack.prefix.find((val) => val.type === "node")?.prefix ?? ["cpn", "srv"],
    version: process.env.npm_package_version ?? "1.4.1",
  })
})

const Server = https.createServer(cert, app)
const io = require("socket.io")(Server, {
  cors: { origin: config.origin },
})
const SSHClient = require("ssh2").Client
io.on("connection", function (socket) {
  socket.on("auth", function (token) {
    jwt.verify(token, config.settings.jwt_secret, (err, decoded) => {
      if (!err) {
        socket.emit("auth", "authenticated")
        socket.on("node", function (data) {
          let SSHConnection = {
            host: data,
            port: 22,
            username: config.settings.bmc.username,
            tryKeyboard: true,
            password: config.settings.bmc.password,
            // privateKey: fs.readFileSync("./keys/bmc.key"),
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
          }

          if (data.split("-")[0] === "swe") {
            SSHConnection.username = config.settings.switches.username
            SSHConnection.password = config.settings.switches.password
            SSHConnection.privateKey = fs.readFileSync(config.settings.switches.private_key_path)
          }

          var conn = new SSHClient()
          conn
            .on("ready", function () {
              socket.emit("clear", true)
              socket.emit("data", "\r\n Connected to SSH Session: \r\n \r\n")
              conn.shell(function (err, stream) {
                if (err) return socket.emit("data", "\r\n SSH2 SHELL ERROR: " + err.message + " \r\n")
                socket
                  .on("data", function (data) {
                    stream.write(data)
                  })
                  .on("disconnecting", function (e) {
                    // Handle client disconnecting
                    conn.end()
                  })
                stream
                  .on("data", function (d) {
                    socket.emit("data", d.toString("binary"))
                  })
                  .on("close", function () {
                    conn.end()
                  })
              })
            })
            .on("keyboard-interactive", function (name, instr, lang, prompts, cb) {
              if (prompts[0].prompt === "Password: ") cb([config.settings.bmc.password])
            })
            .on("close", function () {
              socket.emit("data", "\r\n Disconnected from SSH Session \r\n")
            })
            .on("error", function (err) {
              socket.emit("data", "\r\n SSH2 CONNECTION ERROR: " + err.message + " \r\n")
            })
            .connect(SSHConnection)
        })
      } else {
        socket.emit("auth", "Authentication failed")
        socket.disconnect()
      }
    })
  })
})

Server.listen(config.port)
