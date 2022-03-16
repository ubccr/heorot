import { TableCell, Tooltip } from "@mui/material"
const NodeCellC = ({ data, type, icon }) => {
  function iconColor(subSystem) {
    let status = null
    if (data[subSystem] !== undefined) status = data[subSystem].status

    if (status === "Warning") return "#ff9800"
    else if (status === "Critical") return "#f44336"
    else if (status === "Good") return "#4caf50"
    else return "#bdbdbd"
  }
  let msg = ""

  if (data[type] !== undefined && data[type].message !== null)
    msg = ": " + data[type].message
  return (
    <TableCell>
      <Tooltip title={type + msg}>
        <i
          className={`bi ${icon}`}
          style={{ color: iconColor(type), fontSize: "25px" }}
        />
      </Tooltip>
    </TableCell>
  )
}

export default NodeCellC
