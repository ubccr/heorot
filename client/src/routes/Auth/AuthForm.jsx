import {
  Button,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"

import { Link } from "react-router-dom"

const AuthForm = ({ form, setSubmit }) => {
  const [formValues, setFormValues] = useState()

  const handleInputChange = (e) => {
    // TODO: validation
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    let form = event.currentTarget

    setSubmit({ username: form.username.value, password: form.password.value })
  }
  return (
    <Container
      sx={{
        textAlign: "center",
        width: "260px",
        border: 1,
        borderRadius: 3,
        borderColor: "primary.main",
        boxShadow: 12,
      }}
    >
      <Typography sx={{ fontSize: 36, fontWeight: "light", letterSpacing: 1 }}>
        {form.name}
      </Typography>
      <Divider />
      <form onSubmit={handleSubmit}>
        <TextField
          name="username"
          label="Username"
          variant="outlined"
          margin="normal"
          onChange={handleInputChange}
        />
        <br />
        <TextField
          name="password"
          label="Password"
          type={"password"}
          variant="outlined"
          margin="normal"
          onChange={handleInputChange}
        />
        {form.button === "Signup" && (
          <TextField
            name="password2"
            label="Re-enter Password"
            type={"password"}
            variant="outlined"
            sx={{ marginBottom: "10px" }}
            onChange={handleInputChange}
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
