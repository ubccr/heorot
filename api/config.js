let config = {}

config.environment = "prod" // dev | prod - disables auth token requirement for api requests
config.origin = "http://localhost:3000" // set to client address

// Keys - see readme in keys api/keys dir
config.keys = {
  bmcKey: "./keys/bmc.key",
  serverKey: "./keys/server.key",
  serverCert: "./keys/server.cert",
}

// Auth
config.auth = {
  API_JWT_SECRET: "", // random string used as a JWT secret
  WARRANTY_API_TOKEN: "", // leave blank
  WARRANTY_API_ID: "", // Dell developer API ID
  WARRANTY_API_SECRET: "", // Dell developer API Secret
}

// BMC
config.bmc = {
  DELL_USER: "", // set to your nodes idrac user - used for Redfish API requests
  DELL_PASS: "", // set to your nodes idrac password
}

// Database - configure for your MongoDB install
config.db = {
  host: "localhost",
  database: "dcim",
  options: {
    auth: { authSource: "admin" },
    user: "api",
    pass: "",
  },
}
if (config.environment === "dev")
  config.db.options.pass = "" // set if you use a separate dev DB

// Grendel
config.grendel = {
  socket: "", // path to Grendel UNIX socket **absolute path**
  configPath: "grendel.toml", // name of grendel config file (relative to cwd)
  mappingName: "mapping.txt",
  cwd: "", // path to grendel config & to write mapping file (ex /home/ubuntu/heorot/grendel)
}

// OpenManage Enterprise
config.ome = {
  url: "", // OME api url
  user: "", // OME api username
  pass: "", // OME api password
}

module.exports = config
