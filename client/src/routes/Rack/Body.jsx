import { TableRow, TableCell } from "@mui/material"
import { Link } from "react-router-dom"
const Body = ({ array }) => {
  let html = []
  let style = {}

  array.forEach((val, index) => {
    if (val.type === "rowSpan") {
      html[val.u] = (
        <TableRow key={val.u}>
          <TableCell align={"center"}>{val.u}</TableCell>
        </TableRow>
      )
    } else if (val.type === "") {
      html[val.u] = (
        <TableRow key={val.u}>
          <TableCell align={"center"}>{val.u}</TableCell>
          <TableCell align={"center"}></TableCell>
        </TableRow>
      )
    } else if (val.type === "node") {
      if (val.height === 1) {
        style.bgcolor = "background.table.single"
        style.border = 2
        style.borderColor = "border.table.single"
      } else if (val.height === 2) {
        style.bgcolor = "background.table.double"
        style.border = 2
        style.borderColor = "border.table.double"
      }
      html[val.u] = (
        <TableRow key={val.u}>
          <TableCell align={"center"}>{val.u}</TableCell>
          <TableCell align={"center"} sx={{ ...style }} rowSpan={val.height}>
            <Link to={`/Node/${val.node}`}>{val.node}</Link>
          </TableCell>
        </TableRow>
      )
    }
  })

  return html.reverse()
}

export default Body
