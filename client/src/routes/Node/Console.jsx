// Fit addon seems to break line wrapping on small window sizes - Reverting to fixed width and overflow scroll

import "xterm/css/xterm.css"

import React, { useContext, useEffect, useRef } from "react"

import { Box } from "@mui/material"
import { Terminal } from "xterm"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { io } from "socket.io-client"
import { useState } from "react"

// TODO: fix useEffects

const Console = ({ node, query }) => {
  const [user] = useContext(UserContext)
  const termRef = useRef(null)

  useEffect(() => {
    let bmc =
      query.data.result.interfaces.length > 1
        ? query.data.result.interfaces.find((e) => e.bmc === true)?.fqdn
        : query.data.result.interfaces[0]?.fqdn
    if (bmc.length < 2) {
      let tmpBmc =
        query.data.result.interfaces.length > 1
          ? query.data.result.interfaces.find((e) => e.bmc === true)?.ip
          : query.data.result.interfaces[0]?.ip
      bmc = tmpBmc.split("/")[0]
    }
    if (bmc === undefined) return
    const terminal = new Terminal({ cursorBlink: true, cols: 90, rows: 30 })
    const socket = io(`wss://${apiConfig.apiUrl.substring(8)}`)

    terminal.open(termRef.current)
    terminal.write("\r\n Connecting to WebSocket... \r\n")

    socket.on("connect", () => {
      socket.emit("auth", user.accessToken ?? "")
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
            "\r\n Authentication to WebSocket failed.\r\n Try logging out and back in, or check your config.js \r\n"
          )
      })
    })
    return function cleanup() {
      socket.close()
      terminal.dispose()
    }
  }, [node])

  return <Box ref={termRef} sx={{ overflowX: "auto" }} />
}

export default Console
