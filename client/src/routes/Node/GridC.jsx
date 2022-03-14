import { Grid, Button, Typography } from "@mui/material"

const GridC = ({ heading, data, button }) => {
  return (
    <Grid
      container
      sx={{
        overflow: "hidden",
        padding: "10px",
        marginTop: "12px",
        alignItems: "center",
        border: 1,
        borderRadius: "10px",
        borderColor: "border.main",
        bgcolor: "background.main",
        color: "text.primary",
        boxShadow: 12,
        height: 60,
      }}
    >
      <Grid item xs>
        <Typography variant="h2" sx={{ fontSize: "18pt", paddingLeft: 2 }}>
          {heading}
        </Typography>
      </Grid>
      {data && (
        <Grid item xs sx={{ justifyContent: "flex-end" }}>
          <Typography
            variant="h2"
            sx={{ fontSize: "14pt", textAlign: "right", paddingRight: "10px" }}
          >
            {data}
          </Typography>
        </Grid>
      )}
      {button && (
        <Grid
          item
          xs={3}
          sm={2}
          md={1}
          sx={{ textAlign: "center", textAlign: "end" }}
        >
          <Button variant="outlined">{button}</Button>
        </Grid>
      )}
    </Grid>
  )
}

export default GridC
