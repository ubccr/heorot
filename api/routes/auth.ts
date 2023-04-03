import { Router } from "express"
import { User } from "../models/User.js"
import auth from "../modules/auth.js"
import config from "../../config/config.js"
import pkg_bc from "bcryptjs"
import pkg_jwt from "jsonwebtoken"
const { sign } = pkg_jwt
const { compareSync, hashSync } = pkg_bc

const app = Router()

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/auth" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/auth/",
    availibleRoutes: routes,
  })
})

app.post("/signup", async (req, res) => {
  const data = {
    username: req.body.username,
    password: hashSync(req.body.password, 10),
    privileges: "none",
    background: "none",
    theme: "light",
  }

  // Sets first user created as an admin
  let users = await User.find({})
  if (users.length === 0) data.privileges = "admin"

  let query = await User.findOne({ username: data.username })
  if (query === null) {
    let newUser = new User({ ...data })
    // TODO: verify
    let res = await newUser.save()
  } else res.json({ status: "error", message: "User already exists" })
})

app.post("/signin", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  let query = await User.findOne({ username: username })
  // TODO: Handle query errors
  if (query !== null) {
    if (compareSync(password, query.password)) {
      let token = sign({ id: query.id }, config.settings.jwt_secret, {
        expiresIn: 28800, // 8 hours
      })
      res.send({
        status: "success",
        message: `Welcome ${username}, Successfully logged in`,
        username: username,
        privileges: query.privileges,
        accessToken: token,
        background: query.background,
        theme: query.theme,
      })
    } else res.json({ status: "error", message: "Password incorrect" })
  } else res.json({ status: "error", message: "Username not found" })
})

app.post("/changePassword", auth, async (req, res) => {
  let query = await User.updateOne({ _id: req.userId }, { password: hashSync(req.body.newPassword, 10) })
  if (query.modifiedCount > 0) res.json({ status: "success", message: "Successfully updated password!" })
  else res.json({ status: "error", message: "Error, password unchanged" })
})

app.get("/users", auth, async (req, res) => {
  let query = await User.find().select("username privileges createdAt updatedAt").exec()
  if (query !== null) {
    res.send({
      status: "success",
      result: query,
    })
  } else {
    res.send({
      status: "error",
      message: "DB query error",
    })
  }
})

app.post("/updateUsers", auth, async (req, res) => {
  const action = req.body.action
  const users = req.body.users.map((x: any) => {
    return { username: x }
  })

  try {
    let query = await User.updateMany({ $or: users }, { $set: { privileges: action } })
    res.json({
      status: "success",
      message: "Users have been successfully updated",
    })
  } catch (err) {
    res.json({
      status: "error",
      message: "DB query error",
      error: err,
    })
  }
})

app.post("/verifyToken", auth, async (req, res) => {
  res.json({ status: "success", message: "Token is valid" })
})

app.post("/setTheme", auth, async (req, res) => {
  const theme = req.body.theme
  const userId = req.userId

  try {
    await User.updateOne({ id: userId }, { theme: theme }).exec()
    res.send({
      status: "success",
      message: "Theme successfully updated",
      theme: theme,
    })
  } catch (err) {
    res.json({
      status: "error",
      message: "DB connection error",
      error: err,
    })
  }
})

export default app
