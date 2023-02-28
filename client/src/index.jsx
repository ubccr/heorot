import App from "./App"
import { HashRouter } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom"

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
)
