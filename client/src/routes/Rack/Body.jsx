import {
  TableRow,
  TableCell,
  Table,
  TableBody,
  TableContainer,
  Button,
  Tooltip,
  Zoom,
} from "@mui/material"
import { Link } from "react-router-dom"

const Body = ({ array }) => {
  let html = []
  let style = {}

  const switchGen = (element, index, pos) => {
    if (element !== null) {
      let interfaceDisplay = ""
      let tmp = element.find((el) => {
        if (el.bmc === false && element.length > 1) return true
      })
      let bmcName = element[0].interface.split(".")
      if (tmp === undefined) interfaceDisplay = bmcName[0]
      else interfaceDisplay = tmp.node

      return (
        <TableCell
          key={index}
          style={{
            width: "30px",
            padding: "3px",
          }}
        >
          <Tooltip
            arrow
            title={`${interfaceDisplay}`}
            placement={pos}
            TransitionComponent={Zoom}
          >
            <Button
              variant="outlined"
              component={Link}
              to={`/Node/${element[0].node}`}
              sx={{ minWidth: "30px", width: "30px" }}
              size="small"
            >
              {index}
            </Button>
          </Tooltip>
        </TableCell>
      )
    } else
      return (
        <TableCell
          key={index}
          align="center"
          style={{
            minWidth: "30px",
            width: "30px",
            padding: "3px",
          }}
        >
          {index}
        </TableCell>
      )
  }
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
                        <Link to={`/Node/${val.node[0]}`}>{val.node[0]}</Link>
                      </TableCell>
                    )}
                    {val.node[1] !== undefined && (
                      <TableCell
                        align="center"
                        sx={{ borderLeft: 2, borderColor: "border.table.quad" }}
                      >
                        <Link to={`/Node/${val.node[1]}`}>{val.node[1]}</Link>
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
    } else if (val.type === "switch") {
      if (val.ports.length > 0) {
        let switchHtmlTop = []
        let switchHtmlBottom = []

        val.ports.forEach((element, index) => {
          if (index % 2) switchHtmlTop.push(switchGen(element, index, "top"))
          else switchHtmlBottom.push(switchGen(element, index, "bottom"))
        })
        html[val.u] = (
          <TableRow key={val.u}>
            <TableCell align={"center"}>{val.u}</TableCell>
            <TableCell style={{ maxWidth: "200px" }}>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>{switchHtmlTop}</TableRow>
                    <TableRow>{switchHtmlBottom}</TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </TableCell>
          </TableRow>
        )
      }
    }
  })

  return html.reverse()
}

export default Body
