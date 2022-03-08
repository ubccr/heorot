import { Box, Container, Divider, Typography } from "@mui/material"

function Home() {
  return (
    <>
      <Container style={{ textAlign: "center" }}>
        <Box
          sx={{
            padding: "20px",
            border: 1,
            borderRadius: 3,
            borderColor: "primary.main",
            boxShadow: 12,
            bgcolor: "action.hover",
            color: "text.primary",
          }}
        >
          <Typography variant="h3">
            Dev React webpage designed by: Josh Furlani
          </Typography>
          <Divider />
          <Typography variant="h6">
            Report any feature feature requests and / or bugs to
            jafurlan@buffalo.edu
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default Home
