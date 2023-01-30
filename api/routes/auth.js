const express = require("express")
const app = express.Router()
let config = require("../config")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../modules/auth")

app.get("/", (req, res) => {
  let routes = []
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
    password: bcrypt.hashSync(req.body.password, 10),
    privileges: "none",
    background: "none",
    theme: "light",
  }

  // Sets first user created as an admin
  let count = await User.countDocuments({})
  if (count === 0) data.privileges = "admin"

  let query = await User.findOne({ username: data.username }).exec()
  if (query === null) {
    let newUser = new User({ ...data })
    newUser.save(function (err, user) {
      if (err)
        res.json({
          status: "error",
          message: "An error occured while saving to the DB",
          err,
        })
      else
        res.json({
          status: "success",
          message: "User successfully created, please wait for admin approval",
          user: user.username,
        })
    })
  } else res.json({ status: "error", message: "User already exists" })
})

app.post("/signin", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  let query = await User.findOne({ username: username }).exec()
  // TODO: Handle query errors
  if (query !== null) {
    if (bcrypt.compareSync(password, query.password)) {
      let token = jwt.sign({ id: query.id }, config.auth.API_JWT_SECRET, {
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
  let query = await User.updateOne({ _id: req.userId }, { password: bcrypt.hashSync(req.body.newPassword, 10) })
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
  const users = req.body.users.map((x) => {
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

module.exports = app
