let config = {}

config.environment = "prod" // dev | prod - dev allows you to make api requests without auth
config.origin = "https://localhost:443" // Only change if you are using a separate Client and API
config.port = 443 // API port

// Keys - see readme -> Keys for more info
config.keys = {
  serverKey: "./keys/server.key",
  serverCert: "./keys/server.cert",
}

// Auth
config.auth = {
  API_JWT_SECRET: "", // Please enter a random string used as a JWT secret | You can use: openssl rand -base64 32
  WARRANTY_API_TOKEN: "", // leave blank
  WARRANTY_API_ID: "", // Dell developer API ID
  WARRANTY_API_SECRET: "", // Dell developer API Secret
}

// BMC
config.bmc = {
  DELL_USER: "", // set to your nodes idrac/redfish user
  DELL_PASS: "", // set to your nodes idrac/redfish password
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
}

// OpenManage Enterprise
config.ome = {
  url: "",
  user: "",
  pass: "",
}

// Grendel pxe firmware list | changes the firmware options shown in lists
config.firmware = ["ipxe.pxe", "ipxe-i386.efi", "ipxe-x86_64.efi", "snponly-x86_64.efi", "undionly.kpxe"]

// Login information for switch queries | Should be a user with privileges to run ex: show mac address-table, show interfaces status, show inventory
// Switches will need proper tags | see readme.MD -> Grendel Tags
config.switches = {
  user: "",
  pass: "",
}

// Floorplan page config:
config.floorplan = {
  // "Rack" view color mapping
  tag_mapping: [
    { tag: "ubhpc", color: "primary" }, // tag: "set to grendel tag of slurm partition" color: "MUI color"
    { tag: "faculty", color: "success" },
  ],
  tag_multiple: { tag: "mixed", color: "error" }, // color if there are multiple tag types in a rack
  color_mapping: {
    default_color: "primary",
    secondary_color: "floorplan", // if regex doesn't match: set to this color | Must be MUI color or custom color added to theme in app.js
    model_color: [
      // switch model coloring array | order matters, last item will take precidence!
      // display: "Legend text in the UI", color: "MUI or custom color", model: "regex to match switch model"
      { display: "No Management Switch", color: "primary", model: /^S/ },
      { display: "Management Switch", color: "error", model: /^PC/ },
    ],
    version_color: [
      // switch version coloring array | order matters, last item will take precidence!
      // display: "Legend text in the UI", color: "MUI or custom color", version: "regex to match switch versions"
      { display: "OS8", color: "error", version: /^8/ },
      { display: "OS9", color: "warning", version: /^9/ },
      { display: "OS10", color: "primary", version: /^10/ },
    ],
  },

  // loyout modification | allows you to add or remove rows / columns
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
