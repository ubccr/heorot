import "./App.css"
import "bootstrap-icons/font/bootstrap-icons.css"

import { Container, Paper, ThemeProvider, createTheme } from "@mui/material"
import { QueryClient, QueryClientProvider } from "react-query"
import { Route, Routes } from "react-router-dom"
import { useEffect, useState } from "react"

import Alerts from "./routes/Alerts/Index"
import AppBarC from "./components/AppBarC"
import FloorPlan from "./routes/Floorplan"
import Grendel from "./routes/Grendel/Index"
import Home from "./routes/Home"
import Login from "./routes/Auth/Login"
import ManageSwitches from "./routes/Admin/ManageSwitches"
import ManageUsers from "./routes/Admin/ManageUsers"
import Node from "./routes/Node"
import { PluginContext } from "./contexts/PluginContext"
import PrivateRoute from "./components/PrivateRoute"
import Profile from "./routes/Profile/Profile"
import Rack from "./routes/Rack"
import Settings from "./routes/Settings"
import Signup from "./routes/Auth/Signup"
import { SnackbarProvider } from "notistack"
import { ThemeContext } from "./contexts/ThemeContext"
import { UserContext } from "./contexts/UserContext"
import Warranty from "./routes/Admin/Warranty"
import { apiConfig } from "./config"
import darkTriangles from "./backgrounds/large-triangles-dark.svg"
// import largeTriangles from "./backgrounds/large-triangles.svg"
import { useAutoAnimate } from "@formkit/auto-animate/react"

function App() {
  const [appRef] = useAutoAnimate({ duration: 150 })
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
  const [plugins, setPlugins] = useState({})

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
      fetch(`${apiConfig.apiUrl}/plugins`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success") {
            setPlugins(result)
          }
        })
    }
  }, [user])

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
              img: "linear-gradient(126.29deg, #00baff 0%, #000066 100%)",
              // img: `url(${largeTriangles})`,
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
              secondary: "#bdbdbd",
              // 600 level colors
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
                four: "#e53935",
              },
            },
            floorplan: {
              main: "#9e9e9e",
            },
          }
        : {
            primary: {
              main: "rgba(255, 255, 255, 0.8)",
            },
            background: {
              main: "#262626",
              // main: "rgba(255, 255, 255, 0.08)",
              img: `url(${darkTriangles})`,
              lighter: "#3b3b3b",
              table: {
                single: "",
                double: "",
                four: "",
              },
            },
            border: {
              main: "#424242",
              secondary: "#616161",
              table: {
                single: "#ffb300",
                double: "#43a047",
                quad: "#2196f3",
                four: "#e53935",
              },
            },
            floorplan: {
              main: "#bdbdbd",
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
                <PluginContext.Provider value={[plugins, setPlugins]}>
                  <Paper
                    sx={{
                      bgcolor: "background.default",
                      minHeight: "100vh",
                      maxHeight: "max-content",
                      backgroundImage: theme.palette.background.img,
                    }}
                  >
                    <AppBarC />
                    <Container maxWidth="xl" ref={appRef}>
                      <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="/Signup" element={<Signup />} />

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
                        <Route
                          path="/Admin/ManageSwitches"
                          element={
                            <PrivateRoute access="admin">
                              <ManageSwitches />{" "}
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/Profile"
                          element={
                            <PrivateRoute access="none">
                              <Profile />{" "}
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/Settings"
                          element={
                            <PrivateRoute access="admin">
                              <Settings />{" "}
                            </PrivateRoute>
                          }
                        />
                      </Routes>
                    </Container>
                  </Paper>
                </PluginContext.Provider>
              </ThemeContext.Provider>
            </UserContext.Provider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
