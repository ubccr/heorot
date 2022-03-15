import { TableRow, TableCell, Table, TableBody } from "@mui/material"
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
      if (val.height === 1 && val.width === 1) {
        style.bgcolor = "background.table.single"
        style.border = 2
        style.borderColor = "border.table.single"
      } else if (val.height === 2) {
        style.bgcolor = "background.table.double"
        style.border = 2
        style.borderColor = "border.table.double"
      } else if (val.height === 1 && val.width === 2) {
        style.bgcolor = "background.table.quad"
        style.border = 2
        style.borderColor = "border.table.quad"
        style.padding = "0px"
      }
      if (val.height === 1 && val.width === 2) {
        html[val.u] = (
          <TableRow key={val.u}>
            <TableCell align={"center"}>{val.u}</TableCell>
            <TableCell align={"center"} sx={{ ...style }} rowSpan={val.height}>
              <Table>
                <TableBody>
                  <TableRow>
                    {val.node[0] !== undefined && (
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: 2,
                          borderColor: "border.table.quad",
                        }}
                      >
                        <Link to={`/Node/${val.node}`}>{val.node[0]}</Link>
                      </TableCell>
                    )}
                    {val.node[1] !== undefined && (
                      <TableCell
                        align="center"
                        sx={{ borderLeft: 2, borderColor: "border.table.quad" }}
                      >
                        <Link to={`/Node/${val.node}`}>{val.node[1]}</Link>
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        )
      } else {
        html[val.u] = (
          <TableRow key={val.u}>
            <TableCell align={"center"}>{val.u}</TableCell>
            <TableCell align={"center"} sx={{ ...style }} rowSpan={val.height}>
              <Link to={`/Node/${val.node}`}>{val.node}</Link>
            </TableCell>
          </TableRow>
        )
      }
    }
  })

  return html.reverse()
}

export default Body
