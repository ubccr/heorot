import { Box, Button, FormGroup, TextField, Typography } from "@mui/material"

import Header from "../../components/Header"
import BgContainer from "../../components/BgContainer"

const Warranty = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    let tags = e.currentTarget.tags.value
  }
  return (
    <Box>
      <Header header="Warranty" />
      <BgContainer>
        <Typography variant="h2" sx={{ fontSize: "20pt" }}>
          Enter grendel tag of nodes to query Dell's Warranty API:
        </Typography>
        <br />
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <TextField name="tags" label="Tag" />
            <br />
            <Button type="submit" variant="outlined">
              Submit
            </Button>
          </FormGroup>
        </form>
      </BgContainer>
    </Box>
  )
}

export default Warranty
