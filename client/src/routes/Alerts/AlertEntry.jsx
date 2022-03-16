import {
  Button,
  LinearProgress,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import NodeCellC from "./NodeCellC"
import SELCustom from "./SELCustom"

const AlertEntry = ({ data }) => {
  //   const [systemHealth, setSystemHealth] = useState()
  //   const [loading, setLoading] = useState(true)

  let id = data.id
  const result = useQuery(["alert", id], async () => {
    const res = await (
      await fetch(
        `http://${window.location.hostname}:3030/openmanage/health/${id}`
      )
    ).json()
    return res
  })

  function iconColor(subSystem) {
    let status = null
    if (result.data.result[subSystem] !== undefined)
      status = result.data.result[subSystem].status

    if (status === "Warning") return "#ff9800"
    else if (status === "Critical") return "#f44336"
    else if (status === "Good") return "#4caf50"
    else return "#bdbdbd"
  }

  let statusColor = ""
  if (data.status === 3000) statusColor = "#ff9800"
  else if (data.status === 4000) statusColor = "#f44336"

  if (data.deviceName.length >= 32)
    data.deviceName = data.deviceName.split(".")[0]

  return (
    <TableRow>
      {result.isLoading && (
        <TableCell colSpan={9}>
          <LinearProgress />
        </TableCell>
      )}
      {result.isFetched && (
        <>
          <TableCell sx={{ borderColor: statusColor }}>
            <Typography variant="h1" sx={{ fontSize: "16pt" }}>
              {data.deviceName}
            </Typography>
          </TableCell>
          <TableCell>{data.serviceTag}</TableCell>

          <SELCustom
            data={result.data.result}
            node={data.deviceName}
            type="SEL/Misc"
            icon="bi-journal-text"
          />
          <NodeCellC data={result.data.result} type="Processor" icon="bi-cpu" />

          <NodeCellC data={result.data.result} type="Memory" icon="bi-memory" />

          <NodeCellC data={result.data.result} type="Fan" icon="bi-fan" />

          <NodeCellC
            data={result.data.result}
            type="Storage"
            icon="bi-device-hdd"
          />
          <NodeCellC
            data={result.data.result}
            type="Temperature"
            icon="bi-thermometer-half"
          />
          <NodeCellC
            data={result.data.result}
            type="Battery"
            icon="bi-battery-half"
          />
        </>
      )}
    </TableRow>
  )
}

export default AlertEntry
