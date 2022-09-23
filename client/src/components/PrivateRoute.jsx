import { Navigate } from "react-router-dom"

export default function PrivateRoute({ children, access }) {
  const user = JSON.parse(localStorage.getItem("user"))
  if (user === null) return <Navigate to="/login" />

  return mapping(user.privileges, access) ? children : <Navigate to="/" />
}

function mapping(user, access) {
  if (toNum(user) >= toNum(access)) return true

  return false
}
function toNum(role) {
  switch (role) {
    case "admin":
      return 2
    case "user":
      return 1
    case "none":
      return 0
    default:
      break
  }
  return 0
}
