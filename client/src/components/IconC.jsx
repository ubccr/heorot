import { CheckBoxOutlined, ReportOutlined, WarningAmberOutlined } from "@mui/icons-material/"

const IconC = ({ icon }) => {
  let res = ""
  switch (icon) {
    case "OK":
      res = <CheckBoxOutlined color="success" />
      break
    case "Warning":
      res = <WarningAmberOutlined sx={{ color: "#ff9800" }} />
      break
    case "Critical":
      res = <ReportOutlined sx={{ color: "#c62828" }} />
      break
    default:
      break
  }
  return res
}

export default IconC
