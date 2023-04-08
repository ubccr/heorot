import express from "express"

const app = express.Router()

app.get("/", (req, res) => {
  let routes: any = []
  app.stack.forEach((element) => {
    routes.push("/switches" + element.route.path)
  })
  res.json({
    status: "success",
    currentRoute: "/switches/",
    availibleRoutes: routes,
  })
})

export default app
