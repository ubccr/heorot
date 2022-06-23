import { Routes, Route } from "react-router-dom"
import { Container, createTheme, Paper, ThemeProvider } from "@mui/material"
import { useEffect, useState } from "react"

import "./App.css"
import "bootstrap-icons/font/bootstrap-icons.css"

// --- Components ---
import { ThemeContext } from "./contexts/ThemeContext"
import { UserContext } from "./contexts/UserContext"
import PrivateRoute from "./components/PrivateRoute"
import { QueryClient, QueryClientProvider } from "react-query"
import { SnackbarProvider } from "notistack"
import { apiConfig } from "./config"

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
import Alerts from "./routes/Alerts/Index"
import Warranty from "./routes/Admin/Warranty"
import Grendel from "./routes/Grendel/Index"
import ManageUsers from "./routes/Admin/ManageUsers"

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

  useEffect(() => {
    if (user !== null) {
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": user.accessToken,
        },
        body: JSON.stringify({}),
      }
      fetch(`${apiConfig.apiUrl}/auth/verifyToken`, payload)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "error") {
            setUser(null)
            setMode("light")
            localStorage.clear("user")
          }
        })
    }
  }, [])

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
              // 100 level colors
              table: {
                single: "#ffe0b2",
                double: "#c8e6c9",
                quad: "#bbdefb",
                four: "#ffcdd2",
              },
            },
            border: {
              main: "#e0e0e0",
              // 600 level colors
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
                four: "#e53935",
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
                four: "",
              },
            },
            border: {
              main: "#424242",
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
                four: "#e53935",
              },
            },
          }),
    },
  })
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} autoHideDuration={7000}>
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

                      <Route
                        path="/FloorPlan"
                        element={
                          <PrivateRoute access="user">
                            <FloorPlan />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Rack/:rack"
                        element={
                          <PrivateRoute access="user">
                            <Rack />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Alerts"
                        element={
                          <PrivateRoute access="user">
                            <Alerts />{" "}
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Grendel"
                        element={
                          <PrivateRoute access="user">
                            <Grendel />{" "}
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Node/:node"
                        element={
                          <PrivateRoute access="user">
                            <Node />{" "}
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Admin/Warranty"
                        element={
                          <PrivateRoute access="admin">
                            <Warranty />{" "}
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/Admin/ManageUsers"
                        element={
                          <PrivateRoute access="admin">
                            <ManageUsers />{" "}
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                  </Container>
                </Paper>
              </ThemeContext.Provider>
            </UserContext.Provider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
