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
  TableContainer,
  DialogContent,
  Dialog,
} from "@mui/material"
import { useEffect, useState, useContext } from "react"
import SELTable from "./SELTable"
import IconC from "../../../components/IconC"
import ErrorC from "../../../components/ErrorC"
import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"

const TableC = ({ node }) => {
  const [apiData, setApiData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useContext(UserContext)

  useEffect(() => {
    setLoading(true)
    setError("")
    let payload = {
      headers: {
        "x-access-token": user.accessToken,
      },
    }
    fetch(`${apiConfig.apiUrl}/redfish/dell/${node}`, payload)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          setApiData(response.result)
          let arr = Object.values(response.result)
          arr.forEach((val, index) => {
            if (val.status === "error" && val.message !== "No GPU tag") {
              setError(val.message)
            }
          })
        } else {
          setError("SEL API error")
        }
        setLoading(false)
      })
  }, [node])

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
            <Dialog open={openSEL} onClose={handleCloseSEL} maxWidth="xl">
              <DialogContent>
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
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </Box>
  )
}

export default TableC
