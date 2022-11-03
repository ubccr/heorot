import { Button, Divider, Grid, TextField } from "@mui/material"
import { useContext, useState } from "react"

import BgContainer from "../../components/BgContainer"
import Header from "../../components/Header"
import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useQuery } from "react-query"
import { useSnackbar } from "notistack"

const Profile = () => {
  const [user] = useContext(UserContext)
  const [newPassword, setNewPassword] = useState("")
  const { enqueueSnackbar } = useSnackbar()

  const query = useQuery(
    ["changePassword", newPassword],
    async ({ signal }) => {
      let payload = {
        method: "POST",
        headers: {
          "x-access-token": user.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          newPassword: newPassword,
        }),
        signal,
      }
      const res = await (await fetch(`${apiConfig.apiUrl}/auth/changePassword`, payload)).json()
      enqueueSnackbar(res.message, { variant: res.status })

      return res
    },
    { enabled: false }
  )
  return (
    <>
      <Header header="Profile" />
      <BgContainer>
        <Grid container spacing={2} sx={{ display: "flex", alignItems: "center", padding: "10px" }}>
          <Grid item xs={6}>
            Username:
          </Grid>
          <Grid item xs={6} textAlign="end">
            {user.username}
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} md={6}>
            Change password:
          </Grid>
          <Grid item xs={12} md={6} textAlign="end">
            <TextField
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              sx={{ marginRight: "5px" }}
            />
            <Button variant="outlined" onClick={() => query.refetch()}>
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            Theme:
          </Grid>
          <Grid item xs={6} textAlign="end">
            {user.theme}
          </Grid>
        </Grid>
      </BgContainer>
    </>
  )
}

export default Profile
