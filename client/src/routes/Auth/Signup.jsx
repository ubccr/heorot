import AuthForm from "./AuthForm"
import { useState } from "react"

const Signup = () => {
  const form = {
    name: "Signup",
    button: "Signup",
    subtitle: "Already have an Account?",
    link: "Login",
  }
  const [submit, setSubmit] = useState()
  console.log(submit)
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Signup
