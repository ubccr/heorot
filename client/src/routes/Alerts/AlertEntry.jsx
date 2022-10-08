import { LinearProgress, TableCell, TableRow, Typography } from "@mui/material"

import { Link } from "react-router-dom"
import NodeCellC from "./NodeCellC"
import SELCustom from "./SELCustom"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const AlertEntry = ({ data }) => {
  const [testRef] = useAutoAnimate(null)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  let id = data.id
  const result = useQuery(["alert", id], async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/openmanage/health/${id}`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: res.status })
    return res
  })

  let statusColor = ""
  if (data.status === 3000) statusColor = "#ff9800"
  else if (data.status === 4000) statusColor = "#f44336"

  if (data.deviceName.length > 15) data.deviceName = data.deviceName.split(".")[0]

  return (
    <TableRow ref={testRef}>
      {result.isLoading && (
        <TableCell colSpan={9}>
          <LinearProgress />
        </TableCell>
      )}
      {result.isFetched && result.data.status === "success" && (
        <>
          <TableCell sx={{ borderColor: statusColor }}>
            <Typography variant="h1" sx={{ fontSize: "16pt" }}>
              <Link to={`/Node/${data.deviceName}`}>{data.deviceName}</Link>
            </Typography>
          </TableCell>
          <TableCell>{data.serviceTag}</TableCell>

          <SELCustom data={result.data.result} node={data.deviceName} type="SEL/Misc" icon="bi-journal-text" />
          <NodeCellC data={result.data.result} type="Processor" icon="bi-cpu" />

          <NodeCellC data={result.data.result} type="Memory" icon="bi-memory" />

          <NodeCellC data={result.data.result} type="Fan" icon="bi-fan" />

          <NodeCellC data={result.data.result} type="Storage" icon="bi-device-hdd" />
          <NodeCellC data={result.data.result} type="Temperature" icon="bi-thermometer-half" />
          <NodeCellC data={result.data.result} type="Battery" icon="bi-battery-half" />
        </>
      )}
    </TableRow>
  )
}

export default AlertEntry
