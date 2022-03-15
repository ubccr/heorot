import { Routes, Route } from "react-router-dom"
import { Container, createTheme, Paper, ThemeProvider } from "@mui/material"
import { useState } from "react"

import "./App.css"

// --- Components ---
import { ThemeContext } from "./contexts/ThemeContext"
import largeTriangles from "./backgrounds/large-triangles.svg"
import darkTriangles from "./backgrounds/large-triangles-dark.svg"

import AppBarC from "./components/AppBarC"
import Home from "./routes/Home"
import Profile from "./routes/Profile/Profile"
import Login from "./routes/Auth/Login"
import Signup from "./routes/Auth/Signup"
import FloorPlan from "./routes/FloorPlan/FloorPlan"
import Rack from "./routes/Rack/Rack"
import Node from "./routes/Node/Index"

function App() {
  const [mode, setMode] = useState("light")
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            background: {
              main: "rgba(255, 255, 255, 1)",
              img: `url(${largeTriangles})`,
              table: {
                single: "#ffe082",
                double: "#a5d6a7",
              },
            },
            border: {
              main: "#e0e0e0",
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
              },
            },
          }
        : {
            primary: {
              main: "rgba(255, 255, 255, 0.8)",
            },
            background: {
              main: "rgba(255, 255, 255, 0.08)",
              lighter: "#3b3b3b",
              table: {
                single: "",
                double: "",
              },
            },
            border: {
              main: "#424242",
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
              },
            },
          }),
    },
  })
  return (
    <>
      <ThemeProvider theme={theme}>
        <ThemeContext.Provider value={[mode, setMode]}>
          <Paper
            sx={{
              bgcolor: "background.default",
              minHeight: "100vh",
              maxHeight: "max-content",
              backgroundImage: theme.palette.background.img,
            }}
          >
            <AppBarC />
            <Container>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Signup" element={<Signup />} />
                <Route path="/Profile" element={<Profile />} />

                <Route path="/FloorPlan" element={<FloorPlan />} />
                <Route path="/Rack/:rack" element={<Rack />} />
                <Route path="/Node/:node" element={<Node />} />
              </Routes>
            </Container>
          </Paper>
        </ThemeContext.Provider>
      </ThemeProvider>
    </>
  )
}

export default App
