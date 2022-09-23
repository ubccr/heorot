import { useContext, useEffect, useState } from "react"

import AuthForm from "./AuthForm"
import { ThemeContext } from "../../contexts/ThemeContext"
import { UserContext } from "../../contexts/UserContext"
import { signin } from "../../modules/Auth"
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"

const Login = () => {
  const form = {
    name: "Login",
    button: "Login",
    subtitle: "Need an account?",
    link: "Signup",
  }
  const [submit, setSubmit] = useState()
  const [mode, setMode] = useContext(ThemeContext)
  const [user, setUser] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    const data = async () => {
      if (submit !== undefined && submit.password !== "") {
        let response = await signin(submit.username, submit.password)
        if (response.status === "success") {
          setMode(response.theme)
          setUser(response)
          navigate(-1)
        }
        enqueueSnackbar(response.message, { variant: response.status })
      }
    }
    data()
  }, [submit])
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Login
