import {
  Button,
  TableCell,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  Box,
  LinearProgress,
  Alert,
  Dialog,
  DialogContent,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"

// FIXME: This is temporary
import SELTable from "../Node/SELTable"

const SELCustom = ({ data, node, type, icon }) => {
  const [openSEL, setOpenSEL] = useState(false)
  const handleOpenSEL = () => setOpenSEL(true)
  const handleCloseSEL = () => setOpenSEL(false)
  const [sel, setSel] = useState(null)
  const [selLoading, setSelLoading] = useState(true)
  const [selError, setSelError] = useState("")

  useEffect(() => {
    if (node !== undefined) {
      fetch(`http://${window.location.hostname}:3030/redfish/sel/${node}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "success") setSel(result.result)
          else if (result.status === "failed") setSelError(result.message)

          setSelLoading(false)
        })
    }
    return () => {
      setSel(null)
      setSelError("")
      setSelLoading(true)
    }
  }, [])

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
          {selLoading && <LinearProgress />}
          {!selLoading && selError === "" && (
            <SELTable data={sel.selRes.sel.entries} />
          )}
          {!selLoading && selError !== "" && (
            <Alert variant="outlined" severity="error">
              {selError}
            </Alert>
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
