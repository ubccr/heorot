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
import { useState, useContext } from "react"
import { useSnackbar } from "notistack"
import { UserContext } from "../../contexts/UserContext"
import { apiPort } from "../../config"

const Warranty = () => {
  const [tags, setTags] = useState("")
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useContext(UserContext)

  const query = useQuery(["warranty", tags], queryFunction, {
    enabled: !!tags,
    cacheTime: 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTags(e.currentTarget.tags.value)
  }

  async function queryFunction({ queryKey }) {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    const res = await (
      await fetch(
        `https://${window.location.hostname}:${apiPort}/warranty/add/${queryKey[1]}`,
        payload
      )
    ).json()
    enqueueSnackbar(res.message, { variant: res.color })
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
      </BgContainer>
    </Box>
  )
}

export default Warranty
