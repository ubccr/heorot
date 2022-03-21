import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  TextField,
} from "@mui/material"
import { Box } from "@mui/system"
import React, { useState } from "react"
import NewGridC from "./NewGridC"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AlertC from "../../components/AlertC"

const Tags = ({ node, data, refetch, setRefetch }) => {
  const [tags, setTags] = useState(data)
  const [addTag, setAddTag] = useState("")

  const [openAlert, setOpenAlert] = useState(false)
  const [message, setMessage] = useState("")
  const [color, setColor] = useState("success")

  const handleDelete = (removedTag) => () => {
    setTags((chips) => chips.filter((chip) => chip !== removedTag))
  }

  const handleAddTag = () => {
    setTags([...tags, addTag])
    setAddTag("")
  }
  const handleReset = () => {
    setTags(data)
  }
  const handleSubmit = async () => {
    let addOutput = []
    let removeOutput = []
    let display = false
    setMessage("")

    tags.forEach((element) => {
      if (!data.includes(element)) {
        addOutput.push(element)
        display = true
      }
    })
    data.forEach((element) => {
      if (!tags.includes(element)) {
        removeOutput.push(element)
        display = true
      }
    })
    let mes = ""
    mes += await changeTags(addOutput, node, "Add")
    mes += await changeTags(removeOutput, node, "Remov")
    setMessage(mes)
    if (display) setOpenAlert(!openAlert)
    setRefetch(!refetch)

    async function changeTags(tags, node, method) {
      if (tags.length > 0) {
        let url = ""
        if (method === "Add") {
          url = `http://${
            window.location.hostname
          }:3030/grendel/tag/${node}/${tags.join(",")}`
        } else {
          url = `http://${
            window.location.hostname
          }:3030/grendel/untag/${node}/${tags.join(",")}`
        }
        let result = await (await fetch(url)).json()
        if (result.grendelResponse === "success") {
          setColor("success")
          return method + "ed: [" + result.response.tags + "] "
        } else {
          setColor("error")
          return (
            method + " tags failed. Response: " + result.response.message + " "
          )
        }
      } else {
        return ""
      }
    }
  }

  return (
    <>
      <NewGridC heading="Tags:">
        <Box sx={{ textAlign: "end" }}>
          <Accordion
            style={{
              backgroundImage: "none",
              backgroundColor: "rgba(255,255,255,0)",
            }}
            sx={{
              bgcolor: "background.main",
              boxShadow: 0,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: "100%", textAlign: "end" }}>
                {tags.map((element, index) => (
                  <Chip
                    variant="outlined"
                    color="primary"
                    key={index}
                    label={element}
                    onDelete={handleDelete(element)}
                    sx={{ margin: "2px" }}
                  />
                ))}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ textAlign: "center" }}>
              <TextField
                size="small"
                name="newTag"
                onChange={(e) => setAddTag(e.target.value)}
                value={addTag}
                sx={{ margin: "5px" }}
              />
              <Button
                variant="outlined"
                sx={{ margin: "5px" }}
                onClick={handleAddTag}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                sx={{ margin: "5px" }}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                sx={{ margin: "5px" }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </AccordionDetails>
          </Accordion>
        </Box>
      </NewGridC>
      <AlertC
        color={color}
        message={message}
        openAlert={openAlert}
        setOpenAlert={setOpenAlert}
      />
    </>
  )
}

export default Tags
