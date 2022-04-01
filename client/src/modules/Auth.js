import { apiPort } from "../config"

export async function signin(username, password) {
  const url = `https://${window.location.hostname}:${apiPort}/auth/signin`
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  }
  try {
    let response = await fetch(url, payload)
    let data = await response.json()

    if (data.accessToken !== undefined)
      localStorage.setItem("user", JSON.stringify(data))
    return data
  } catch (error) {
    return { status: "error", message: "API call failed", error }
  }
}

export async function signup(username, password) {
  const url = `https://${window.location.hostname}:${apiPort}/auth/signup`
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  }
  try {
    let response = await fetch(url, payload)
    let data = await response.json()
    return data
  } catch (error) {
    return { status: "error", message: "API call failed", error }
  }
}

export function logout() {
  localStorage.removeItem("user")
}
