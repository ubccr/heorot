import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

import AlertEntry from "./AlertEntry"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

// TODO: refactor entire alerts page
// TODO: ditch OME and query nodes automatically?

const Index = () => {
  const [tableRef] = useAutoAnimate(null)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery("omNodes", async ({ signal }) => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
      signal,
    }
    const res = await (await fetch(`${apiConfig.apiUrl}/openmanage/nodes`, payload)).json()
    if (res.status === "error") enqueueSnackbar(res.message, { variant: "error" })
    return res
  })
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "26pt",
            textAlign: "center",
            marginBottom: "16px",
            padding: "10px",
            border: 1,
            borderRadius: "10px",
            borderColor: "border.main",
            bgcolor: "background.main",
            color: "text.primary",
            boxShadow: 16,
            width: "300px",
          }}
        >
          Hardware Alerts
        </Typography>
      </Box>
      <Box
        sx={{
          padding: "10px",
          marginTop: "12px",
          alignItems: "center",
          border: 1,
          borderRadius: "10px",
          borderColor: "border.main",
          bgcolor: "background.main",
          color: "text.primary",
          boxShadow: 12,
        }}
      >
        <TableContainer ref={tableRef} sx={{ maxHeight: "calc(100vh - 220px)" }}>
          {query.isLoading && <LinearProgress />}
          {query.isFetched && query.data.status !== "error" && (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "background.main" }}>Node:</TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"80px"}>
                    Service Tag:
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"80px"}>
                    SEL
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    CPU
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    MEM
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    Fan
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    HDD
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    Temp
                  </TableCell>
                  <TableCell sx={{ bgcolor: "background.main" }} width={"40px"}>
                    Batt
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.result.warningNodes.map((val, index) => (
                  <AlertEntry key={index} data={val} />
                ))}
                {query.data.result.criticalNodes.map((val, index) => (
                  <AlertEntry key={index} data={val} />
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>
    </Box>
  )
}

export default Index
