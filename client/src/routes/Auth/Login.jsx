import AuthForm from "./AuthForm"
import { useState, useEffect, useContext } from "react"
import { signin } from "../../modules/Auth"
import { ThemeContext } from "../../contexts/ThemeContext"
import { UserContext } from "../../contexts/UserContext"
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

  useEffect(async () => {
    if (submit !== undefined && submit.password !== "") {
      let response = await signin(submit.username, submit.password)
      if (response.status === "success") {
        setMode(response.theme)
        setUser(response)
        navigate(-1)
      }
      enqueueSnackbar(response.message, { variant: response.status })
    }
  }, [submit])
  return <AuthForm form={form} setSubmit={setSubmit} />
}

export default Login
