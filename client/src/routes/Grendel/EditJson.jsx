import { useState } from "react"
import { Typography, TextareaAutosize, FormGroup } from "@mui/material"
import SearchC from "../../components/AppBar/SearchC"

const EditJson = () => {
  const [editNode, setEditNode] = useState("")

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "16pt", marginTop: "20px" }}>
        Edit JSON:
      </Typography>
      <SearchC action="value" setOutput={setEditNode} />
      <FormGroup>
        <TextareaAutosize
          style={{ padding: "5px", margin: "10px" }}
          defaultValue={editNode}
        />
      </FormGroup>
    </>
  )
}

export default EditJson
