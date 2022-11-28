let config = {}

config.environment = "prod" // dev | prod - dev allows you to make api requests without auth
config.origin = "https://localhost:443" // Only change if you are using a separate Client and API
config.port = 443 // API port

// HTTPS certs
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
  firmware_versions: [
    // latest bios and bmc version mapping to node type | will need to be changed when newer firmwares release
    { model: /(R|C)[0-9]5[0-9]{1,2}/g, bios: "1.7.5", bmc: "5.10.50.15" }, // dell 15th gen
    { model: /(R|C)[0-9]5[0-9]5/g, bios: "2.8.4", bmc: "5.10.50.00" }, // dell 15th gen - AMD
    { model: /(R|C)[0-9]4[0-9]{1,2}/g, bios: "2.15.1", bmc: "5.10.50.15" }, // dell 14th gen
    { model: /R[2-3]40/g, bios: "2.10.1", bmc: "5.10.50.00" }, // dell 14th gen (2 and 3 series)
    { model: /(R|C)[0-9]3[0-9]{1,2}/g, bios: "2.15.0", bmc: "2.83.83.83" }, // dell 13th gen
    { model: /(R|C)[0-9]2[0-9]{1,2}/g, bios: "2.9.0", bmc: "2.65.65.65" }, // dell 12th gen
  ],
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
  socket: "/var/lib/grendel/grendel-api.socket", // absolute path to Grendel UNIX socket (user nodejs is running as needs permissions to access {add to grendel group})
}

// OpenManage Enterprise
config.ome = {
  url: "",
  user: "",
  pass: "",
}

// Grendel pxe firmware list | changes the firmware options shown in lists
config.firmware = ["ipxe.pxe", "ipxe-i386.efi", "ipxe-x86_64.efi", "snponly-x86_64.efi", "undionly.kpxe"]

// Login information for switch queries | Should be a user with privileges to run: show mac address-table, show interfaces status, show inventory
config.switches = {
  user: "",
  pass: "",
  privateKeyPath: "", // absolute path to private key | nodejs user (ex: grendel) must have read privileges on key file
}

// Floorplan page config:
config.floorplan = {
  tag_mapping: [
    { tag: "ubhpc", color: "primary" }, // {tag: "set to grendel tag of slurm partition" color: "MUI color"}
    { tag: "faculty", color: "success" },
  ],
  tag_multiple: { tag: "mixed", color: "error" }, // color if there are multiple tag types in a rack
  color_mapping: {
    default_color: "primary",
    secondary_color: "floorplan", // if regex doesn't match: set to this color | Must be MUI color or custom color added to theme in app.js
    model_color: [
      // switch model coloring array | order matters, last item will take precedence!
      // display: "Legend text in the UI", color: "MUI or custom color", model: "regex to match switch model"
      { display: "No Management Switch", color: "primary", model: /^S/ },
      { display: "Management Switch", color: "error", model: /^PC/ },
    ],
    version_color: [
      // switch version coloring array | order matters, last item will take precedence!
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

// Rack page config
config.rack = {
  max: 42,
  min: 1,
  prefix: [
    // prefix mapping | modify if your prefix naming scheme varies from the default
    { type: "switch", prefix: ["swe", "swi"] },
    { type: "node", prefix: ["cpn", "srv"] },
    { type: "pdu", prefix: ["pdu"] },
  ],
  node_size: [
    // node model size mapping | sets height and width of nodes based on their model (from redfish query)
    { models: ["R2", "R3", "R4", "R6", "C4"], height: 1, width: 1 },
    { models: ["R5", "R7", "R8"], height: 2, width: 1 },
    { models: ["R9"], height: 4, width: 1 },
    { models: ["C6"], height: 1, width: 2 }, // dell 6 series cloud nodes are technically 2u per chassis but rendering 2x 1u nodes makes the data manipulation much easier
    // other high density blade enclosures like the Dell M1000 are not officially supported, though they *should* render if added to the array
  ],
}

module.exports = config
