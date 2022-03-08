import { Routes, Route, Link } from "react-router-dom"

import "./App.css"

// --- Components ---
import AppBarC from "./components/AppBarC"
import Home from "./routes/Home"
import Profile from "./routes/Profile/Profile"
import Login from "./routes/Auth/Login"
import Signup from "./routes/Auth/Signup"

function App() {
  return (
    <>
      <AppBarC />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>
    </>
    // <div style={{ height: "100vh" }}>
    // </div>
  )
}

export default App
