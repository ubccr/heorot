import { Box, Container, Divider, Typography } from "@mui/material"
import { Link } from "react-router-dom"

function Home() {
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
          <Typography variant="body1">
            New users can signup <Link to="/Signup">here</Link>
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default Home
