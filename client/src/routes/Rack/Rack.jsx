import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  Box,
  TableContainer,
  LinearProgress,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"

const Rack = () => {
  const { rack } = useParams()

  const [isRackLoading, setIsRackLoading] = useState(true)
  const [rows, setRows] = useState()

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/client/rack/${rack}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          let test = []
          response.result.forEach((val, index) => {
            if (val !== null) {
              if (val.switch === undefined) {
                test.push({
                  id: index,
                  node: val.node[0].name,
                  width: val.width,
                  height: val.height,
                })
              }
            } else {
              test.push({ id: index, node: "" })
            }
          })
          setRows(test)

          setIsRackLoading(false)
        }
      })
  }, [])
  const cols = [
    {
      field: "id",
      headerName: "U",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "node",
      headerName: rack,
      minWidth: 200,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ]

  return (
    <Container>
      <Box>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            sx={{
              height: "90vh",
              "& .single": {
                backgroundColor: "background.table.single",
                border: 1,
                borderColor: "border.table.single",
                borderCollapse: "separate",
              },
              "& .double": {
                backgroundColor: "background.table.double",
                border: 1,
                borderColor: "border.table.double",
                borderCollapse: "separate",
              },
              "& .empty": {},
            }}
          >
            {isRackLoading && <LinearProgress />}
            {!isRackLoading && (
              <div style={{ width: "100%", height: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={cols}
                  initialState={{
                    pagination: { pageSize: 42 },
                    sorting: {
                      sortModel: [{ field: "id", sort: "desc" }],
                    },
                  }}
                  maxColumns={2}
                  getCellClassName={(params) => {
                    if (params.row.height === 2 && params.field !== "id") {
                      return "double"
                    }
                    if (params.row.height === 1 && params.field !== "id") {
                      return "single"
                    }
                    return "empty"
                  }}
                />
              </div>
            )}
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  )
}

export default Rack
