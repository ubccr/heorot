let config = {}

config.environment = "prod" // dev | prod - allows you to make api requests without auth
config.origin = "https://localhost:443" // If using separate API & Client change to client addr
config.port = 443 // API port

// Keys - see readme in keys api/keys dir
// Console redirection can now be used with password based auth
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
config.firmware = ["ipxe.pxe", "ipxe-i386.efi", "ipxe-x86_64.efi", "snponly-x86_64.efi", "undionly.kpxe"]

// Switch login information for switch queries | Should be a user with privileges to run ex: show mac address-table, show interfaces status, show ivnentory
// Switches will need proper tags | see readme.MD -> Grendel Tags
config.switches = {
  user: "",
  password: "",
}

// Floorplan loyout modification | allows you to add or remove rows / columns
config.floorplan = {
  floorX: [..."defghijklmnopqrstuvw"],
  floorY: [
    "28",
    "27",
    "26",
    "25",
    "24",
    "23",
    "22",
    "21",
    "17",
    "16",
    "15",
    "14",
    "13",
    "12",
    "11",
    "10",
    "09",
    "08",
    "07",
    "06",
    "05",
  ],
}

module.exports = config
