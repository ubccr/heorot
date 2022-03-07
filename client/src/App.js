import { Routes, Route, Link } from "react-router-dom"
import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"

// import { ThemeContext } from "./contexts/ThemeContext"
import bgDefault from "./backgrounds/large-triangles.svg"

// --- Components ---
import NavbarC from "./components/NavbarC"
import Home from "./routes/Home"
import Profile from "./routes/Profile/Profile"

function App() {
  const bg = `url(${bgDefault})`
  return (
    <div style={{ height: "100vh", backgroundImage: bg }}>
      <NavbarC />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
