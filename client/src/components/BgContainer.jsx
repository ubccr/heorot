import { Box } from "@mui/material"

const BgContainer = ({ children }) => {
  return (
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
      {children}
    </Box>
  )
}

export default BgContainer
