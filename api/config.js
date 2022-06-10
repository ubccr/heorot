let config = {}

config.environment = "prod" // dev | prod - disables auth token requirement for api requests
config.origin = "https://localhost:443" // set to client address if using separate API & Client
config.port = 443 // WebUI port

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

// Dev environemnt only
if (config.environment === "dev") config.db.options.pass = ""

// Grendel
config.grendel = {
  socket: "", // path to Grendel UNIX socket **absolute path**
  configPath: "/etc/grendel/grendel.toml", // path to grendel config file
  mappingName: "/home/ubuntu/heorot/api/mapping.txt", // path to writable directory for mapping file
}

// OpenManage Enterprise
config.ome = {
  url: "", // OME api url
  user: "", // OME api username
  pass: "", // OME api password
}

module.exports = config
