import { Box, Typography } from "@mui/material"

const Header = ({ header }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: "26pt",
          textAlign: "center",
          marginBottom: "16px",
          padding: "10px",
          border: 1,
          borderRadius: "10px",
          borderColor: "border.main",
          bgcolor: "background.main",
          color: "text.primary",
          boxShadow: 16,
          width: "300px",
        }}
      >
        {header}
      </Typography>
    </Box>
  )
}

export default Header
