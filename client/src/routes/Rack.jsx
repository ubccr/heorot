import React, { useContext, useState } from "react"

import { UserContext } from "../../contexts/UserContext"
import { apiConfig } from "../../config"
import { useParams } from "react-router-dom"

const Rack = () => {
  const { rack } = useParams()

  const [user] = useContext(UserContext)

  return <div>Rack</div>
}

export default Rack
