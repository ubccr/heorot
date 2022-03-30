import AuthForm from "./AuthForm"
import { useState, useEffect } from "react"
import { signup } from "../../modules/Auth"
import { useSnackbar } from "notistack"

const Signup = () => {
  const { enqueueSnackbar } = useSnackbar()
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
      enqueueSnackbar(response.message, { variant: response.status })
    }
  }, [submit])
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Signup
