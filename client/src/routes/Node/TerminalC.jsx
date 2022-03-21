import { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { io } from "socket.io-client"
import "xterm/css/xterm.css"

const TerminalC = ({ node, BMC }) => {
  const term = useRef(null)

  useEffect(() => {
    const terminal = new Terminal({ cursorBlink: true })
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    const socket = io(`ws://${window.location.hostname}:3030`)

    terminal.open(term.current)
    fitAddon.fit()

    terminal.write("\r\n Attempting to connect to WebSocket...\r\n ")
    let user = JSON.parse(localStorage.getItem("user"))
    let token = ""
    if (user) token = user.accessToken

    socket.on("connect", function () {
      socket.emit("auth", token) // *** Not secure, just to prevent unauthenticated ws connections
      socket.on("auth", function (data) {
        if (data === "authenticated") {
          terminal.write("\r\n Authenticated to WebSocket! \r\n")
          socket.emit("node", BMC)
          terminal.write("\r\n Attempting to connect to " + node + ".. \r\n")
          // Browser -> Backend
          terminal.onKey(function (ev) {
            socket.emit("data", ev.key)
          })

          // Backend -> Browser
          socket.on("data", function (data) {
            terminal.write(data)
          })

          socket.on("disconnect", function () {
            terminal.write("\r\n Disconnected from WebSocket.. \r\n")
          })
        } else terminal.write("\r\n Authentication to Websocket failed. \r\n")
      })
    })
    return function cleanup() {
      socket.close()
      terminal.dispose()
    }
  }, [])

  return <div ref={term}></div>
}

export default TerminalC
