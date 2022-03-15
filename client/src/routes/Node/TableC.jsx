import {
  Table,
  Box,
  TableHead,
  TableRow,
  TableCell,
  Button,
  TableBody,
  LinearProgress,
  Typography,
  Modal,
  Fade,
  Backdrop,
  TableContainer,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import SELTable from "./SELTable"
import IconC from "../../components/IconC"
import ErrorC from "../../components/ErrorC"

const TableC = ({ node }) => {
  const [apiData, setApiData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3030/redfish/dell/${node}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          setApiData(response.result)
          let arr = Object.values(response.result)
          arr.forEach((val, index) => {
            if (val.status === "failed" && val.message !== "No GPU tag") {
              setError(val.message)
            }
            setLoading(false)
          })
        }
      })
  }, [])

  const [openSEL, setOpenSEL] = useState(false)
  const handleOpenSEL = () => setOpenSEL(true)
  const handleCloseSEL = () => setOpenSEL(false)

  function gpuhtml() {
    let res = []
    apiData.gpuRes.GPUs.forEach((val, index) => {
      res.push(
        <TableRow key={index}>
          <TableCell>GPU {index + 1}:</TableCell>
          <TableCell align="right">{val.Name}</TableCell>
          <TableCell align="center">
            <IconC icon={val.Health} />
          </TableCell>
        </TableRow>
      )
    })
    return res
  }

  return (
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
      {loading && <LinearProgress />}
      {error !== "" && <ErrorC message={error} />}
      {!loading && error === "" && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h1" sx={{ fontSize: "22px" }}>
                      Redfish API Information:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={handleOpenSEL}>
                      Show SEL
                    </Button>
                  </TableCell>
                  <TableCell align="right" width={"20px"}>
                    <Typography variant="h1" sx={{ fontSize: "16px" }}>
                      Health
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Model:</TableCell>
                  <TableCell align="right">{apiData.biosRes.Model}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Tag:</TableCell>
                  <TableCell align="right">
                    {apiData.biosRes.ServiceTag}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>BIOS Version:</TableCell>
                  <TableCell align="right">
                    {apiData.biosRes.BiosVersion}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>BMC Version:</TableCell>
                  <TableCell align="right">
                    {apiData.idracRes.Firmware}
                  </TableCell>
                  <TableCell align="center">
                    <IconC icon={apiData.idracRes.Health} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Vlan:</TableCell>
                  <TableCell align="right">{apiData.idracRes.vlan}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Boot Order:</TableCell>
                  <TableCell align="right">
                    {apiData.biosRes.BootOrder}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Memory Size:</TableCell>
                  <TableCell align="right">
                    {apiData.biosRes.MemorySize}
                  </TableCell>
                  <TableCell align="center">
                    <IconC icon={apiData.sensorsRes.memory} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>CPU 1:</TableCell>
                  <TableCell align="right">{apiData.biosRes.CPU1}</TableCell>
                  <TableCell align="center">
                    <IconC icon={apiData.sensorsRes.cpu1} />
                  </TableCell>
                </TableRow>
                {apiData.biosRes.CPU2 !== undefined && (
                  <TableRow>
                    <TableCell>CPU 2:</TableCell>
                    <TableCell align="right">{apiData.biosRes.CPU2}</TableCell>
                    <TableCell align="center">
                      <IconC icon={apiData.sensorsRes.cpu2} />
                    </TableCell>
                  </TableRow>
                )}
                {apiData.gpuRes.status === "success" && gpuhtml()}
              </TableBody>
            </Table>
          </TableContainer>
          <div>
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              open={openSEL}
              onClose={handleCloseSEL}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={openSEL}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderRadius: "15px",
                    boxShadow: 24,
                    width: "85%",
                    height: "90%",
                    overflowY: "scroll",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "background.main",
                      borderRadius: "15px",
                      p: 4,
                    }}
                  >
                    <SELTable data={apiData.selRes.sel.entries} />
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
                  </Box>
                </Box>
              </Fade>
            </Modal>
          </div>
        </>
      )}
    </Box>
  )
}

export default TableC
