import {
  Button,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"

import BgContainer from "../../components/BgContainer"
import Header from "../../components/Header"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useContext } from "react"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const ManageSwitches = () => {
  const [user] = useContext(UserContext)

  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["updateSw"],
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/switches/v1/refetchAll`, payload)).json()
      if (!res.hasOwnProperty("silent")) enqueueSnackbar(res.message, { variant: res.status })
      else if (res.hasOwnProperty("silent")) console.error(`${res.message}`)

      return res
    },
    { enabled: false }
  )

  return (
    <>
      <Header header="Manage Switches" />
      <BgContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {query.isFetching && <LinearProgress color="primary" />}
          </Grid>
          <Grid item xs={12} textAlign="center">
            <Button variant="outlined" onClick={() => query.refetch()}>
              Refetch all switches
            </Button>
          </Grid>
          <Grid item xs={12}>
            {query.isFetched && query.data.failed.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Error messages:</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {query.data.failed.map((val) => (
                      <TableRow>
                        <TableCell align="center">{val}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </BgContainer>
    </>
  )
}

export default ManageSwitches
