let config = {}

config.environment = "prod" // dev | prod - dev allows you to make api requests without auth
config.origin = "https://localhost:443" // Only change if you are using a separate Client and API
config.port = 443 // API port
config.WARRANTY_API_TOKEN = "" // leave blank
config.key = "" // Encryption key for passwords stored in DB generate with: openssl rand -hex 32

// HTTPS certs
config.keys = {
  serverKey: "./keys/server.key",
  serverCert: "./keys/server.cert",
}

// Database - configure for your MongoDB install
config.db = {
  host: "mongodb", // change to localhost for sources install | mongodb ip address
  database: "heorot",
  options: {
    authSource: "admin",
    user: "root",
    pass: "changeme",
  },
}

// Grendel
config.grendel = {
  socket: "/var/lib/grendel/grendel-api.socket", // absolute path to Grendel UNIX socket (user nodejs is running as needs permissions to access aka add to grendel group)
}

config.settings = {}

module.exports = config
