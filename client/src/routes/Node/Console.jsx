// Fit addon seems to break line wrapping on small window sizes - Reverting to fixed width and overflow scroll
// Also xterm v5+ breaks fonts, seems to be because I assign everything (*) to a google font in the index.html, but I cannot override with :not(.xterm)...

import "xterm/css/xterm.css"

import React, { useEffect, useRef } from "react"

import { Box } from "@mui/material"
import { Terminal } from "xterm"
import { apiConfig } from "../../config"
import { io } from "socket.io-client"
import { useState } from "react"

const Console = ({ node, query }) => {
  // get bmc function
  const [bmc, setBmc] = useState(undefined)
  useEffect(() => {
    if (query.isFetched === true) {
      setBmc(query.data.result.interfaces.find((e) => e.bmc === true).fqdn)
    }
  }, [node])

  //  xterm
  const termRef = useRef(null)

  useEffect(() => {
    if (bmc === undefined) return
    const terminal = new Terminal({ cursorBlink: true })
    const socket = io(`wss://${apiConfig.apiUrl.substring(8)}`)

    terminal.open(termRef.current)
    terminal.write("\r\n Connecting to WebSocket... \r\n")

    // auth
    let user = JSON.parse(localStorage.getItem("user"))
    let token = ""
    if (user) token = user.accessToken

    socket.on("connect", () => {
      socket.emit("auth", token)
      socket.on("auth", (data) => {
        if (data === "authenticated") {
          terminal.write("\r\n Authentication successful \r\n")
          socket.emit("node", bmc)
          terminal.write("\r\n Attempting to connect to " + node + ".. \r\n")
          // Browser -> Backend
          terminal.onKey(function (ev) {
            socket.emit("data", ev.key)
          })

          // Backend -> Browser
          socket.on("data", function (data) {
            terminal.write(data)
          })
          socket.on("clear", function (data) {
            if (data === true) terminal.clear()
          })

          socket.on("disconnect", function () {
            terminal.write("\r\n Disconnected from WebSocket.. \r\n")
          })
        } else
          terminal.write(
            "\r\n Authentication to WebSocket failed. Try logging out and back in, or check your config.js \r\n"
          )
      })
    })
    return function cleanup() {
      socket.close()
      terminal.dispose()
    }
  }, [node, bmc])

  return <Box ref={termRef} sx={{ padding: 0, overflowY: "scroll" }} />
}

export default Console
