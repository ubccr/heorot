import { Box, Card, CardContent, Typography } from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

const Switches = ({ query, setRefresh }) => {
  if (query.data.switch_data.status === "error")
    return (
      <Typography variant="h2" fontSize={22}>
        Error: {query.data.switch_data.message}
      </Typography>
    )
  let data = query.data.switch_data
  const cards = [
    {
      data: [
        {
          text: `Model: ${data.result[0].output.model}`,
          options: { variant: "h1", fontSize: 22, sx: { marginBottom: "10px" } },
        },
        { text: `OS Version: ${data.result[0].output.version}`, options: { variant: "h2", fontSize: 16 } },
        {
          text: `Service Tag: ${data.result[0].output.serviceTag}`,
          options: { variant: "h2", fontSize: 16, sx: { marginBottom: "5px" } },
        },
        {
          text: `Active Oversubscription: ${data.info.activeOversubscription}`,
          options: { variant: "h1", fontSize: 14 },
        },
        {
          text: `Total Oversubscription: ${data.info.totalOversubscription}`,
          options: { variant: "h1", fontSize: 14 },
        },
      ],
    },
    {
      data: [
        {
          text: `Port Info:`,
          options: { variant: "h1", fontSize: 22, sx: { marginBottom: "10px" } },
        },
        { text: `Active Ports: ${data.info.activePorts}`, options: { variant: "h2", fontSize: 16 } },
        { text: `Total Ports: ${data.info.totalPorts}`, options: { variant: "h2", fontSize: 16 } },
        {
          text: `Fastest Port: ${data.info.fastestPort}G`,
          options: { variant: "h2", fontSize: 16, sx: { marginBottom: "5px" } },
        },
        { text: `Uplink Count ${data.info.uplinkCount}`, options: { variant: "h2", fontSize: 14 } },
        { text: `Uplink Speed: ${data.info.uplinkSpeed}G`, options: { variant: "h2", fontSize: 14 } },
      ],
    },
    ...data.info.uplinks.map((uplink, index) => {
      return {
        data: [
          {
            text: `Uplink ${index + 1}`,
            options: { variant: "h2", fontSize: 22, sx: { marginBottom: "10px" } },
          },
          {
            text: `Port Number: ${uplink.port}`,
            options: { variant: "h2", fontSize: 16 },
          },
          {
            text: `Description: ${uplink.description}`,
            options: { variant: "h2", fontSize: 16 },
          },
          {
            text: `Status: ${uplink.status}`,
            options: { variant: "h2", fontSize: 16 },
          },
          {
            text: `Speed: ${uplink.speed}`,
            options: { variant: "h2", fontSize: 16 },
          },
          {
            text: `Duplex: ${uplink.duplex}`,
            options: { variant: "h2", fontSize: 16 },
          },
          {
            text: `VLAN: ${uplink.vlan}`,
            options: { variant: "h2", fontSize: 16 },
          },
        ],
      }
    }),
  ]
  return (
    <Box sx={{ width: "100%" }}>
      <Grid2 container spacing={1}>
        {cards.map((card, index) => (
          <Grid2 xs={12} sm={6} lg={3} key={index}>
            <Card variant="outlined" sx={{ height: "190px" }}>
              <CardContent>
                {card.data.map((data, index2) => (
                  <Typography {...data.options} key={index2}>
                    {data.text}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  )
}

export default Switches
