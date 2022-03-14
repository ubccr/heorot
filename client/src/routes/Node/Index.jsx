import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Box } from "@mui/material"

import GridC from "./GridC"
import AccordianC from "./AccordianC"
import Interfaces from "./Interfaces"
import TableC from "./TableC"

const Index = () => {
  const { node } = useParams()
  const [apiData, setApiData] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/node/${node}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          let data = response.result[0]
          data.provision = response.result[0].provision.toString()
          data.tags = response.result[0].tags.join(", ")

          setApiData(data)
          setLoading(false)
        }
      })
  }, [])

  return (
    <Box>
      {/* sx={{
          border: 1,
          borderColor: "primary.main",
          boxShadow: 12,
          bgcolor: "background.main",
          color: "text.primary",
        }} */}
      {!loading && (
        <>
          <GridC
            heading="Provision:"
            data={apiData.provision}
            button="Toggle"
          />
          <GridC heading="Tags:" data={apiData.tags} button="Submit" />
          <GridC heading="Firmware:" data={apiData.firmware} />
          <Interfaces data={apiData.interfaces} />
          <GridC heading="Boot Image:" data={apiData.boot_image} />
          <GridC heading="BMC Console:" button="Show" />
          <br />
          <TableC node={node} />
          <br />
        </>
      )}
    </Box>
  )
}

export default Index
