import { Button, Container, Divider, TextField, Typography } from "@mui/material"

import { Link } from "react-router-dom"
import { useState } from "react"

// TODO: change to an Auth package?
// TODO: change to react hook form

const AuthForm = ({ form, setSubmit }) => {
  const [formValues, setFormValues] = useState({})
  const [formError, setFormError] = useState(false)

  const setField = (field, value) => {
    setFormValues({
      ...formValues,
      [field]: value,
    })
    if (!!formError[field])
      setFormError({
        ...formError,
        [field]: null,
      })
  }
  const handleSubmit = (event) => {
    event.preventDefault()

    // signup validation
    if (form.button === "Signup") {
      const newErrors = validateForm()
      if (Object.keys(newErrors).length > 0) setFormError(newErrors)
      else
        setSubmit({
          username: formValues.username,
          password: formValues.password,
        })
    } else
      setSubmit({
        username: formValues.username,
        password: formValues.password,
      })
  }
  function validateForm() {
    const { username, password, password2 } = formValues
    const formErrors = {}

    if (!username || username === "") formErrors.username = "Username cannot be blank"
    else if (username.length > 30) formErrors.username = "Username is over 30 characters"
    else if (username.length < 3) formErrors.username = "Username must be longer than 3 characters"

    if (!password || password === "") formErrors.password = "Password cannot be blank"
    else if (password.length < 8) formErrors.password = "Password must be longer than 8 characters"

    if (!password2 || password2 === "") formErrors.password2 = "Please fill out field"
    else if (password2 !== password) formErrors.password2 = "Passwords do not match"

    return formErrors
  }
  return (
    <Container
      sx={{
        textAlign: "center",
        width: "260px",
        border: 1,
        borderRadius: 3,
        borderColor: "primary.main",
        bgcolor: "background.main",
        boxShadow: 12,
      }}
    >
      <Typography sx={{ fontSize: 36, fontWeight: "light", letterSpacing: 1 }}>{form.name}</Typography>
      <Divider />
      <form onSubmit={handleSubmit}>
        <TextField
          error={!!formError.username}
          helperText={formError.username}
          name="username"
          label="Username"
          variant="outlined"
          margin="normal"
          onChange={(e) => setField("username", e.target.value)}
        />
        <br />
        <TextField
          error={!!formError.password}
          helperText={formError.password}
          name="password"
          label="Password"
          type={"password"}
          variant="outlined"
          margin="normal"
          onChange={(e) => setField("password", e.target.value)}
        />
        {form.button === "Signup" && (
          <TextField
            error={!!formError.password2}
            helperText={formError.password2}
            name="password2"
            label="Re-enter Password"
            type={"password"}
            variant="outlined"
            sx={{ marginBottom: "10px" }}
            onChange={(e) => setField("password2", e.target.value)}
          />
        )}
        <Typography variant="subtitle2" sx={{ fontWeight: "light" }}>
          {form.subtitle}
          <Link to={`/${form.link}`}>
            {" "}
            <Typography
              variant="body1"
              sx={{
                display: "inline",
                fontWeight: "regular",
              }}
            >
              {form.link}
            </Typography>
          </Link>
        </Typography>
        <Button variant="outlined" sx={{ margin: "10px" }} type="submit">
          {form.button}
        </Button>
      </form>
    </Container>
  )
}

export default AuthForm
