import { Box, Container, Divider, Typography } from "@mui/material"

import { Link } from "react-router-dom"
import { UserContext } from "../contexts/UserContext"
import { useContext } from "react"

function Home() {
  const [user] = useContext(UserContext)
  return (
    <>
      <Container
        style={{
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Box
          sx={{
            padding: "20px",
            border: 1,
            borderRadius: 3,
            borderColor: "primary.main",
            boxShadow: 12,
            bgcolor: "background.main",
            color: "text.primary",
          }}
        >
          <Typography variant="h2">Heorot</Typography>
          <br />
          <Divider />
          <Typography variant="body1" sx={{ marginTop: "10px" }}>
            {user === null && (
              <>
                New users can signup <Link to="/Signup">here</Link>
              </>
            )}
            {user !== null && user.status === "success" && user.message}
            {user !== null &&
              user.status === "success" &&
              user.privileges === "none" && (
                <>
                  <br />
                  Please contact an administrator and ask for them to activate
                  your account
                </>
              )}
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default Home
