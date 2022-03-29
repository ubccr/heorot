const express = require("express")
const app = express.Router()

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../modules/auth")

app.get("/", (req, res) => {
  let routes = []
  app.stack.forEach((element) => {
    routes.push(element.route.path)
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
  // query to check if the username is taken
  let query = await User.findOne({ username: data.username }).exec()
  // if query is null set newUser to data obj & save to DB
  if (query === null) {
    let newUser = new User({ ...data })
    newUser.save(function (err, user) {
      // send status with err
      if (err)
        res.json({
          status: "failed",
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
  } else res.json({ status: "failed", message: "User already exists" })
})

app.post("/signin", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  let query = await User.findOne({ username: username }).exec()
  // TODO: query errors?
  if (query !== null) {
    if (bcrypt.compareSync(password, query.password)) {
      let token = jwt.sign({ id: query.id }, process.env.API_JWT_SECRET, {
        expiresIn: 14400, // 4 hours
      })
      res.send({
        status: "success",
        message: "User successfully logged in",
        privileges: query.privileges,
        accessToken: token,
        background: query.background,
        theme: query.theme,
      })
    } else res.json({ status: "failed", message: "Password incorrect" })
  } else res.json({ status: "failed", message: "Username not found" })
})
app.post("/setTheme", auth, async (req, res) => {
  const theme = req.body.theme
  const userId = req.userId

  try {
    let query = await User.updateOne({ id: userId }, { theme: theme }).exec()
    res.send({
      status: "success",
      message: "Theme successfully updated",
      theme: theme,
    })
  } catch (err) {
    res.json({
      status: "failed",
      message: "DB connection error",
      error,
    })
  }
})

module.exports = app
