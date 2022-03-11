import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Box,
  Grid,
  Paper,
  Container,
  Typography,
  List,
  ListItemText,
  ListItem,
  ListItemButton,
  Button,
} from "@mui/material"

const Index = () => {
  const { node } = useParams()

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/node/${node}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          console.log(response)
        }
      })
  }, [])

  return (
    <Container>
      <Box
        sx={{
          border: 1,
          borderColor: "primary.main",
          boxShadow: 12,
          bgcolor: "background.main",
          color: "text.primary",
        }}
      >
        <List>
          <ListItem divider>
            <ListItemText sx={{ textAlign: "start" }}>Provision: </ListItemText>
            <ListItemText sx={{ textAlign: "end", paddingRight: "20px" }}>
              True
            </ListItemText>
            <Button variant="outlined">Toggle</Button>
          </ListItem>
          <ListItem divider>
            <ListItemText sx={{ textAlign: "start" }}>Tags: </ListItemText>
            <ListItemText sx={{ textAlign: "end", paddingRight: "20px" }}>
              ubhpc, h22, gpu
            </ListItemText>
            <Button variant="outlined">Submit</Button>
          </ListItem>
          <ListItem divider>
            <ListItemText>Firmware:</ListItemText>
            <ListItemText sx={{ textAlign: "end" }}>
              snponly-x86_64.efi
            </ListItemText>
          </ListItem>
          <ListItem divider>
            <ListItemText>Boot Image:</ListItemText>
            <ListItemText></ListItemText>
          </ListItem>
          <ListItem divider>
            <ListItemText sx={{ textAlign: "start" }}>
              BMC Console:{" "}
            </ListItemText>
            <Button variant="outlined">Show</Button>
          </ListItem>
        </List>
      </Box>
    </Container>
  )
}

export default Index
