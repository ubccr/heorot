const fs = require("fs")
const https = require("https")

let server = https.createServer({
  key: fs.readFileSync("./keys/server.key"),
  cert: fs.readFileSync("./keys/server.cert"),
})

const io = require("socket.io")(server, {
  cors: {
    origin: "http://10.60.7.202:3000",
  },
})
const SSHClient = require("ssh2").Client
const consoleMessage =
  "\r\n KEY MAPPING FOR CONSOLE REDIRECTION: \r\n \r\n Use the <ESC><1> key sequence for <F1> \r\n Use the <ESC><2> key sequence for <F2> \r\n Use the <ESC><3> key sequence for <F3> \r\n Use the <ESC><0> key sequence for <F10> \r\n Use the <ESC><!> key sequence for <F11> \r\n Use the <ESC><@> key sequence for <F12> \r\n \r\n Use the <ESC><Ctrl><M> key sequence for <Ctrl><M> \r\n Use the <ESC><Ctrl><H> key sequence for <Ctrl><H> \r\n Use the <ESC><Ctrl><I> key sequence for <Ctrl><I> \r\n Use the <ESC><Ctrl><J> key sequence for <Ctrl><J> \r\n \r\n Use the <ESC><X><X> key sequence for <Alt><x>, where x is any letter key, and X is the upper case of that key \r\n \r\n Use the <ESC><R><ESC><r><ESC><R> key sequence for <Ctrl><Alt><Del> \r\n"

io.on("connection", function (socket) {
  socket.on("auth", function (data) {
    if (data === "test") {
      socket.emit("auth", "authenticated")
      let nodeAddr = ""
      socket.on("node", function (data) {
        nodeAddr = data
        // socket.emit("data", consoleMessage)
        let SSHConnection = {
          host: nodeAddr,
          port: 22,
          username: "ccrbmc",
          privateKey: fs.readFileSync("./keys/bmc.key"),
        }
        var conn = new SSHClient()
        conn
          .on("ready", function () {
            socket.emit("data", "\r\n Connected to SSH Session: \r\n")
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
