import {
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  TableContainer,
} from "@mui/material"
import AlertEntry from "./AlertEntry"
import { useQuery } from "react-query"
import { useContext } from "react"
import { UserContext } from "../../contexts/UserContext"
import { apiPort } from "../../config"

const Index = () => {
  const [user, setUser] = useContext(UserContext)

  const query = useQuery("nodes", async () => {
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    const res = await (
      await fetch(
        `https://${window.location.hostname}:${apiPort}/openmanage/nodes`,
        payload
      )
    ).json()
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
        <TableContainer>
          {query.isLoading && <LinearProgress />}
          {query.isFetched && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Node:</TableCell>
                  <TableCell width={"80px"}>Service Tag:</TableCell>
                  <TableCell width={"80px"}>SEL</TableCell>
                  <TableCell width={"40px"}>CPU</TableCell>
                  <TableCell width={"40px"}>MEM</TableCell>
                  <TableCell width={"40px"}>Fan</TableCell>
                  <TableCell width={"40px"}>HDD</TableCell>
                  <TableCell width={"40px"}>Temp</TableCell>
                  <TableCell width={"40px"}>Batt</TableCell>
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
