import { Routes, Route, Link } from "react-router-dom"
import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"

// import { ThemeContext } from "./contexts/ThemeContext"
import bgDefault from "./backgrounds/large-triangles.svg"

// --- Components ---
import NavbarC from "./components/NavbarC"
import Home from "./routes/Home"

function App() {
  return (
    <>
      <div style={{ height: "100vh", backgroundImage: `url(${bgDefault})` }}>
        <NavbarC />
        <Routes>
          <Route exact path="/" element={<Home />} />
        </Routes>
      </div>
    </>
  )
}

export default App
