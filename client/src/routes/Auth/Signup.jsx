import AuthForm from "./AuthForm"
import { useState, useEffect } from "react"
import { signup } from "../../modules/Auth"

const Signup = () => {
  const form = {
    name: "Signup",
    button: "Signup",
    subtitle: "Already have an Account?",
    link: "Login",
  }
  const [submit, setSubmit] = useState()

  useEffect(async () => {
    if (submit !== undefined) {
      let response = await signup(submit.username, submit.password)
      console.log(response)
    }
  }, [submit])
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Signup
