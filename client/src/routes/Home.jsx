import { Container, Divider, Typography } from "@mui/material"

function Home() {
  return (
    <>
      <Container style={{ textAlign: "center" }}>
        <Typography variant="h3">
          Dev React webpage designed by: Josh Furlani
        </Typography>
        <Divider />
        <Typography variant="h6">
          Report any feature feature requests and / or bugs to
          jafurlan@buffalo.edu
        </Typography>
      </Container>
    </>
  )
}

export default Home
