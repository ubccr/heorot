import AuthForm from "./AuthForm"
import { useState } from "react"

// import "./styles.css"

const Login = () => {
  const form = {
    name: "Login",
    button: "Login",
    subtitle: "Need an account?",
    link: "Signup",
  }
  const [submit, setSubmit] = useState()
  console.log(submit)

  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Login
