import { createContext, useState, useContext } from "react"

const ThemeContext = createContext({})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    btn: "outline-primary",
    bg: "bg-light",
    text: "text-dark",
    navBg: "primary",
    navText: "dark",
    navBtn: "outline-light",
  })

  function changeTheme(theme) {
    switch (theme) {
      case "light":
        setTheme({
          btn: "outline-primary",
          bg: "bg-light",
          text: "text-dark",
          navBg: "primary",
          navText: "dark",
          navBtn: "outline-light",
        })
        break
      case "dark":
        setTheme({
          btn: "outline-light",
          bg: "bg-dark",
          text: "text-light",
          navBg: "dark",
          navText: "dark",
          navBtn: "outline-light",
        })
        break
    }
  }

  const value = {
    theme,
    setTheme,
    changeTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
