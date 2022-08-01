import {
  Button,
  TableCell,
  Tooltip,
  Box,
  LinearProgress,
  Dialog,
  DialogContent,
} from "@mui/material"
import { useState, useContext } from "react"
import { apiConfig } from "../../config"
import { UserContext } from "../../contexts/UserContext"

import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

// FIXME: This is temporary
import SELTable from "../Node/components/SELTable"

const SELCustom = ({ data, node, type, icon }) => {
  const [openSEL, setOpenSEL] = useState(false)
  const handleOpenSEL = () => setOpenSEL(true)
  const handleCloseSEL = () => setOpenSEL(false)
  const [user] = useContext(UserContext)
  const { enqueueSnackbar } = useSnackbar()

  const query_sel = useQuery(
    ["sel", node],
    async () => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
      }
      const res = await (
        await fetch(`${apiConfig.apiUrl}/redfish/v1/sel/${node}`, payload)
      ).json()
      if (res.status === "error") {
        enqueueSnackbar(res.message, { variant: "error" })
        setOpenSEL(false)
      }
      return res
    },
    { retry: 2, enabled: !!openSEL }
  )

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
    <>
      <TableCell>
        <Button variant="outlined" onClick={handleOpenSEL}>
          <Tooltip title={type + msg}>
            <i
              className={`bi ${icon}`}
              style={{ color: iconColor(type), fontSize: "25px" }}
            />
          </Tooltip>
        </Button>
      </TableCell>
      <Dialog open={openSEL} onClose={handleCloseSEL} maxWidth="xl">
        <DialogContent>
          {query_sel.isLoading && <LinearProgress />}
          {!query_sel.isLoading &&
            query_sel.status === "success" &&
            query_sel.data.status === "success" && (
              <SELTable data={query_sel.data.logs} />
            )}
          <Box
            sx={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleCloseSEL} variant="outlined">
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SELCustom
