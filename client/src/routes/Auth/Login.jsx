import AuthForm from "./AuthForm"
import { useState, useEffect, useContext } from "react"
import { signin } from "../../modules/Auth"
import { ThemeContext } from "../../contexts/ThemeContext"
// import "./styles.css"

const Login = () => {
  const form = {
    name: "Login",
    button: "Login",
    subtitle: "Need an account?",
    link: "Signup",
  }
  const [submit, setSubmit] = useState()
  const [mode, setMode] = useContext(ThemeContext)

  useEffect(async () => {
    if (submit !== undefined && submit.password !== "") {
      let response = await signin(submit.username, submit.password)
      setMode(response.theme)
    }
  }, [submit])
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Login
