import { Box, Card, CardContent, Typography } from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

const Switches = ({ query, setRefresh }) => {
  if (!query.data.switch_data || query.data.switch_data.success === false)
    return (
      <Typography variant="h2" fontSize={22}>
        Error: {query.data.switch_data.message ?? "Switch data is undefined"}
      </Typography>
    )
  let data = query.data.switch_data
  let warranty_entitlements = []
  query.data?.warranty?.entitlements.forEach((entitlement) => {
    warranty_entitlements.push(
      {
        text: `Type: ${entitlement.entitlementType}`,
        options: { variant: "h2", fontSize: 18 },
      },
      {
        text: `Start Date: ${new Date(entitlement.startDate).toLocaleString()}`,
        options: { variant: "h2", fontSize: 16, sx: { textIndent: "10px" } },
      },
      {
        text: `End Date: ${new Date(entitlement.endDate).toLocaleString()}`,
        options: { variant: "h2", fontSize: 16, sx: { textIndent: "10px" } },
      },
      {
        text: `Code: ${entitlement.serviceLevelCode}`,
        options: { variant: "h2", fontSize: 16, sx: { textIndent: "10px", marginBottom: "10px" } },
      }
    )
  })
  const cards = [
    {
      data: [
        {
          text: `Model: ${data.system.model}`,
          options: { variant: "h1", fontSize: 22, sx: { marginBottom: "10px" } },
        },
        { text: `OS Version: ${data.system.version}`, options: { variant: "h2", fontSize: 16 } },
        {
          text: `Service Tag: ${data.system.service_tag}`,
          options: { variant: "h2", fontSize: 16, sx: { marginBottom: "5px" } },
        },
        {
          text: `Active Oversubscription: ${data.info.active_oversubscription}`,
          options: { variant: "h1", fontSize: 14 },
        },
        {
          text: `Total Oversubscription: ${data.info.total_oversubscription}`,
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
        { text: `Active Ports: ${data.info.active_ports}`, options: { variant: "h2", fontSize: 16 } },
        { text: `Total Ports: ${data.info.total_ports}`, options: { variant: "h2", fontSize: 16 } },
        {
          text: `Fastest Port: ${data.info.fastest_port}G`,
          options: { variant: "h2", fontSize: 16, sx: { marginBottom: "5px" } },
        },
        { text: `Uplink Count ${data.info.uplink_count}`, options: { variant: "h2", fontSize: 14 } },
        { text: `Uplink Speed: ${data.info.uplink_speed}G`, options: { variant: "h2", fontSize: 14 } },
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
    {
      data: [
        {
          text: `Warranty Info:`,
          options: { variant: "h2", fontSize: 22 },
        },
        {
          text: `Ship Date: ${new Date(query.data?.warranty?.shipDate).toLocaleString()}`,
          options: { variant: "h2", fontSize: 18, sx: { marginBottom: "10px" } },
        },
        ...warranty_entitlements,
      ],
    },
  ]
  return (
    <Box sx={{ width: "100%" }}>
      <Grid2 container spacing={1}>
        {cards.map((card, index) => (
          <Grid2 xs={12} sm={6} lg={3} key={index}>
            <Card variant="outlined" sx={{ height: "190px", overflowY: "auto" }}>
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
