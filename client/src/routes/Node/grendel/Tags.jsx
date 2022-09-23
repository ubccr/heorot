import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, TextField } from "@mui/material"
import { useContext, useEffect, useState } from "react"

import { Box } from "@mui/system"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import NewGridC from "../components/NewGridC"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useSnackbar } from "notistack"

const Tags = ({ node, data, refetch, setRefetch }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [tags, setTags] = useState(data)
  const [addTag, setAddTag] = useState("")
  const [user] = useContext(UserContext)

  useEffect(() => {
    setTags(data)
  }, [node, data])

  const handleDelete = (removedTag) => () => {
    setTags((chips) => chips.filter((chip) => chip !== removedTag))
  }

  const handleAddTag = () => {
    setTags([...tags, addTag])
    setAddTag("")
  }
  const handleReset = () => {
    setTags(data)
    enqueueSnackbar("Cleared changes", { variant: "success" })
  }
  const handleSubmit = async () => {
    let addOutput = []
    let removeOutput = []

    tags.forEach((element) => {
      if (!data.includes(element)) {
        addOutput.push(element)
      }
    })
    data.forEach((element) => {
      if (!tags.includes(element)) {
        removeOutput.push(element)
      }
    })
    await changeTags(addOutput, node, "Add")
    await changeTags(removeOutput, node, "Remov")

    setRefetch(!refetch)

    async function changeTags(tags, node, method) {
      if (tags.length > 0) {
        let url = ""
        if (method === "Add") {
          url = `${apiConfig.apiUrl}/grendel/tag/${node}/${tags.join(",")}`
        } else {
          url = `${apiConfig.apiUrl}/grendel/untag/${node}/${tags.join(",")}`
        }
        let payload = {
          headers: {
            "x-access-token": user.accessToken,
          },
        }
        let response = await (await fetch(url, payload)).json()
        if (response.status === "success")
          enqueueSnackbar(method + "ed: [" + response.result.tags + "] ", {
            variant: "success",
          })
        else enqueueSnackbar(method + " tags error. Response: " + response.response.message + " ", { variant: "error" })
      }
    }
  }

  return (
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
            <Button variant="outlined" sx={{ margin: "5px" }} onClick={handleAddTag}>
              Add
            </Button>
            <Button variant="outlined" sx={{ margin: "5px" }} onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outlined" sx={{ margin: "5px" }} onClick={handleSubmit}>
              Submit
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
    </NewGridC>
  )
}

export default Tags
