import {
  Box,
  Button,
  FormGroup,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material"
import { useQuery } from "react-query"

import Header from "../../components/Header"
import BgContainer from "../../components/BgContainer"
import AlertC from "../../components/AlertC"
import { useState } from "react"

const Warranty = () => {
  const [tags, setTags] = useState("")
  const [openAlert, setOpenAlert] = useState(false)

  const query = useQuery(["warranty", tags], queryFunction, {
    enabled: !!tags,
    cacheTime: 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setOpenAlert(false)
    setTags(e.currentTarget.tags.value)
  }

  async function queryFunction({ queryKey }) {
    const res = await (
      await fetch(
        `http://${window.location.hostname}:3030/warranty/add/${queryKey[1]}`
      )
    ).json()
    setOpenAlert(true)
    return res
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

        {query.isLoading && (
          <Box sx={{ margin: "20px" }}>
            <LinearProgress />
          </Box>
        )}
        {query.isFetched && (
          <AlertC
            color={query.data.color}
            message={query.data.message}
            openAlert={openAlert}
            setOpenAlert={setOpenAlert}
          />
        )}
      </BgContainer>
    </Box>
  )
}

export default Warranty
