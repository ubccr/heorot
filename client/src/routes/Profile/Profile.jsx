import { Typography, Container } from "@mui/material"
import { UserContext } from "../../contexts/UserContext"
import { useEffect, useState, useContext } from "react"

const Profile = () => {
  const [user, setUser] = useContext(UserContext)
  return (
    <>
      <Container style={{ textAlign: "center" }}>
        <Typography variant="h3">Profile</Typography>
      </Container>
    </>
  )
}

export default Profile
