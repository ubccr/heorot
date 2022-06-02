import {
  FormGroup,
  Grid,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material"

const AddNodes = () => {
  return (
    <>
      <Typography
        variant="h2"
        sx={{ fontSize: "16pt", marginTop: "20px", marginBottom: "10px" }}
      >
        Add Nodes:
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          <Grid item xs>
            <TextField fullWidth label="Switch" placeholder="swe-z01-22" />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="Domain"
              defaultValue={"compute.cbls.ccr.buffalo.edu"}
            />
          </Grid>
          <Grid item xs>
            <TextField fullWidth label="Subnet" defaultValue={"10.64.0.0"} />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              label="BMC Subnet"
              defaultValue={"10.128.0.0"}
            />
          </Grid>
        </Grid>
        <Typography
          variant="h2"
          sx={{ fontSize: "12pt", marginTop: "20px", marginLeft: "10px" }}
        >
          Host Mapping:
        </Typography>
        <TextareaAutosize
          style={{
            margin: "10px",
            padding: "5px",
          }}
          placeholder="space delimited"
        />
      </FormGroup>
    </>
  )
}

export default AddNodes
