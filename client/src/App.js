import { Routes, Route } from "react-router-dom"
import { Container, createTheme, Paper, ThemeProvider } from "@mui/material"
import { useState } from "react"

import "./App.css"
import "bootstrap-icons/font/bootstrap-icons.css"

// --- Components ---
import { ThemeContext } from "./contexts/ThemeContext"
import { UserContext } from "./contexts/UserContext"
import PrivateRoute from "./components/PrivateRoute"
import { QueryClient, QueryClientProvider } from "react-query"

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
import Signout from "./routes/Auth/Signout"
import Alerts from "./routes/Alerts/Index"

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnmount: true,
        refetchOnReconnect: true,
        retry: true,
      },
    },
  })

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")))
  let userTheme = "light"
  if (user) userTheme = user.theme
  const [mode, setMode] = useState(userTheme)
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <UserContext.Provider value={[user, setUser]}>
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
                    <Route path="/Signout" element={<Signout />} />

                    <Route path="/FloorPlan" element={<FloorPlan />} />
                    <Route path="/Rack/:rack" element={<Rack />} />
                    <Route path="/Alerts" element={<Alerts />} />

                    <Route
                      path="/Node/:node"
                      element={
                        <PrivateRoute access="user">
                          <Node />{" "}
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </Container>
              </Paper>
            </ThemeContext.Provider>
          </UserContext.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
