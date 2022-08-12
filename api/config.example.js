let config = {}

config.environment = "prod" // dev | prod - allows you to make api requests without auth
config.origin = "https://localhost:443" // If using separate API & Client change to client addr
config.port = 443 // API port

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
    authSource: "admin",
    user: "root",
    pass: "changeme",
  },
}

// Grendel
config.grendel = {
  socket: "/var/lib/grendel/grendel-api.socket", // path to Grendel UNIX socket **absolute path** (user nodejs is running as needs permissions to access {add to grendel group})
  configPath: "/etc/grendel/grendel.toml", // path to grendel config file
  mappingName: "/opt/heorot/api/mapping.txt", // path to writable directory for mapping file
}

// OpenManage Enterprise
config.ome = {
  url: "", // OME api url
  user: "", // OME api username
  pass: "", // OME api password
}

// Grendel pxe firmware list | changes the firmware options shown in lists
config.firmware = [
  "ipxe.pxe",
  "ipxe-i386.efi",
  "ipxe-x86_64.efi",
  "snponly-x86_64.efi",
  "undionly.kpxe",
]

module.exports = config
