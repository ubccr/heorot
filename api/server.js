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

app.get("/plugins", async function (req, res) {
  let warranty,
    ome,
    bmc = false
  if (config.auth.WARRANTY_API_ID !== "") warranty = true
  if (config.ome.url !== "") ome = true
  if (config.bmc.DELL_USER !== "") bmc = true

  res.json({
    status: "success",
    warranty: warranty,
    ome: ome,
    bmc: bmc,
  })
})

const Server = https.createServer(cert, app)
const io = require("socket.io")(Server, {
  cors: { origin: config.origin },
})
const SSHClient = require("ssh2").Client
// TODO: Verify key mapping
// const consoleMessage =
//   "\r\n KEY MAPPING FOR CONSOLE REDIRECTION: \r\n \r\n Use the <ESC><1> key sequence for <F1> \r\n Use the <ESC><2> key sequence for <F2> \r\n Use the <ESC><3> key sequence for <F3> \r\n Use the <ESC><0> key sequence for <F10> \r\n Use the <ESC><!> key sequence for <F11> \r\n Use the <ESC><@> key sequence for <F12> \r\n \r\n Use the <ESC><Ctrl><M> key sequence for <Ctrl><M> \r\n Use the <ESC><Ctrl><H> key sequence for <Ctrl><H> \r\n Use the <ESC><Ctrl><I> key sequence for <Ctrl><I> \r\n Use the <ESC><Ctrl><J> key sequence for <Ctrl><J> \r\n \r\n Use the <ESC><X><X> key sequence for <Alt><x>, where x is any letter key, and X is the upper case of that key \r\n \r\n Use the <ESC><R><ESC><r><ESC><R> key sequence for <Ctrl><Alt><Del> \r\n"

io.on("connection", function (socket) {
  socket.on("auth", function (token) {
    jwt.verify(token, config.auth.API_JWT_SECRET, (err, decoded) => {
      if (!err) {
        socket.emit("auth", "authenticated")
        socket.on("node", function (data) {
          nodeAddr = data
          // socket.emit("data", consoleMessage)
          let SSHConnection = {
            host: nodeAddr,
            port: 22,
            username: config.bmc.DELL_USER,
            privateKey: fs.readFileSync("./keys/bmc.key"),
          }
          var conn = new SSHClient()
          conn
            .on("ready", function () {
              socket.emit("clear", true)
              socket.emit("data", "\r\n Connected to SSH Session: \r\n \r\n")
              conn.shell(function (err, stream) {
                if (err)
                  return socket.emit(
                    "data",
                    "\r\n SSH2 SHELL ERROR: " + err.message + " \r\n"
                  )
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
            .on("close", function () {
              socket.emit("data", "\r\n Disconnected from SSH Session \r\n")
            })
            .on("error", function (err) {
              socket.emit(
                "data",
                "\r\n SSH2 CONNECTION ERROR: " + err.message + " \r\n"
              )
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
