const jwt = require("jsonwebtoken")
let config = require("../config")

function auth(req, res, next) {
  if (config.environment === "dev") {
    return next()
  } else {
    let token = req.headers["x-access-token"]
    if (!token) {
      return res
        .status(403)
        .send({ status: "error", message: "No auth token provided" })
    }
    jwt.verify(token, config.auth.API_JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          status: "error",
          message: "Authorization failed. Please login again",
        })
      }
      req.userId = decoded.id
      next()
    })
  }
}

module.exports = auth
