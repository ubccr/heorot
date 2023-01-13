import { Grid, Typography } from "@mui/material"

import { UserContext } from "../../../contexts/UserContext"
import { apiConfig } from "../../../config"
import { useContext } from "react"
import { useQuery } from "react-query"

const WarrantyDisplay = ({ node }) => {
  const [user] = useContext(UserContext)
  const query = useQuery(
    node,
    async ({ signal }) => {
      let payload = {
        headers: {
          "x-access-token": user.accessToken,
        },
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/warranty/get/${node}`, payload)).json()
      return res
    },
    { cacheTime: 0 }
  )

  return (
    <>
      {query.isFetched && query.data.status === "success" && (
        <Grid
          container
          sx={{
            overflow: "hidden",
            padding: "10px",
            marginTop: "12px",
            alignItems: "center",
            border: 1,
            borderRadius: "10px",
            borderColor: "border.main",
            bgcolor: "background.main",
            color: "text.primary",
            boxShadow: 12,
            height: 60,
          }}
        >
          <Grid item xs>
            <Typography variant="h2" sx={{ fontSize: "18pt", paddingLeft: 2 }}>
              Warranty:
            </Typography>
          </Grid>

          <Grid item xs>
            {query.isFetched && query.data.status === "success" && (
              <Typography
                variant="h2"
                sx={{
                  fontSize: "14pt",
                  textAlign: "right",
                  paddingRight: "10px",
                }}
              >
                {query.data.result.warranty === "invalid" && (
                  <i className="bi bi-exclamation-square" style={{ color: "#f44336", marginRight: "5px" }} />
                )}
                {query.data.result.warranty === "valid" && (
                  <i className="bi bi-check2-square" style={{ color: "#4caf50", marginRight: "5px" }} />
                )}{" "}
                {query.data.result.endDate.substring(0, 10)}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </>
  )
}

export default WarrantyDisplay
