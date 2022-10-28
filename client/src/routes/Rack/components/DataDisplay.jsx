import { Avatar, Badge, Chip, Divider, Grid, Tooltip } from "@mui/material"

import React from "react"

const DataDisplay = ({
  type = "chip",
  titleArr = [],
  icon = <></>,
  color = "default",
  label = "", // chip only
  backgroundColor = "default", // avatar only
}) => {
  let title =
    typeof titleArr === "object" ? (
      <Grid container>
        {titleArr.map((val, index) => {
          if (val.name !== undefined)
            return (
              <React.Fragment key={index}>
                <Grid item xs={6}>
                  {val.name}
                </Grid>
                <Grid item xs={6}>
                  {val.data}
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ background: "white" }} />
                </Grid>
              </React.Fragment>
            )
        })}
      </Grid>
    ) : (
      titleArr
    )

  if (type === "avatar")
    return (
      <Badge anchorOrigin={{ vertical: "top", horizontal: "right" }} color={color} variant="dot">
        <Tooltip title={title}>
          <Avatar variant="rounded" sx={{ bgcolor: backgroundColor }}>
            {icon}
          </Avatar>
        </Tooltip>
      </Badge>
    )

  return (
    <Tooltip title={title}>
      <Chip size="small" icon={icon} color={color} label={label} variant="outlined" sx={{ margin: "3px" }} />
    </Tooltip>
  )
}

export default DataDisplay
