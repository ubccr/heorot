let config = {}

config.environment = "dev"
config.origin = "http://10.60.7.202:3000"

// Keys
config.keys = {
  bmcKey: "./keys/bmc.key",
  serverKey: "./keys/server.key",
  serverCert: "./keys/server.cert",
}

// Auth
config.auth = {
  API_JWT_SECRET: process.env.API_JWT_SECRET,
  WARRANTY_API_TOKEN: "",
  WARRANTY_API_ID: process.env.DELL_WARRANTY_API_ID,
  WARRANTY_API_SECRET: process.env.DELL_WARRANTY_API_SECRET,
}

// BMC
config.bmc = {
  DELL_USER: process.env.DELL_BMC_USERNAME,
  DELL_PASS: process.env.DELL_BMC_PASSWORD,
}

// Database
config.db = {
  host: "localhost",
  database: "dcim",
  options: {
    auth: { authSource: "admin" },
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
  },
}
if (config.environment === "dev")
  config.db.options.pass = process.env.DB_DEV_PASSWORD

// Grendel
config.grendel = {
  socket: "/home/ubuntu/dcim/grendel/grendel-api.socket",
  configPath: "grendel.toml",
  mappingName: "mapping.txt",
  cwd: "/home/ubuntu/dcim/grendel",
}

// OpenManage Enterprise
config.ome = {
  url: "https://cld-openmanage.cbls.ccr.buffalo.edu",
  user: process.env.OME_API_USERNAME,
  pass: process.env.OME_API_PASSWORD,
}

module.exports = config
