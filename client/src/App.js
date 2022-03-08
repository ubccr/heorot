import { Routes, Route } from "react-router-dom"
import { createTheme, Paper, ThemeProvider } from "@mui/material"
import { useState } from "react"

import "./App.css"

// --- Components ---
import { ThemeContext } from "./contexts/ThemeContext"
import AppBarC from "./components/AppBarC"
import Home from "./routes/Home"
import Profile from "./routes/Profile/Profile"
import Login from "./routes/Auth/Login"
import Signup from "./routes/Auth/Signup"

function App() {
  const [mode, setMode] = useState("light")
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {}
        : {
            primary: {
              main: "rgba(255, 255, 255, 0.8)",
            },
            background: {
              lighter: "#3b3b3b",
            },
          }),
    },
  })
  return (
    <>
      <ThemeProvider theme={theme}>
        <ThemeContext.Provider value={[mode, setMode]}>
          <Paper sx={{ bgColor: "background.default", height: "100vh" }}>
            <AppBarC />
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Signup" element={<Signup />} />
            </Routes>
          </Paper>
        </ThemeContext.Provider>
      </ThemeProvider>
    </>
  )
}

export default App
