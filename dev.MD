## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Node](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/docs/manual/installation/), and [Grendel](https://github.com/ubccr/grendel) installed.

## :checkered_flag: Dev environment

<!-- TODO: write source build docs -->

```bash
# Install pm2 - a nodejs process manager
$ npm i -g pm2
$ pm2 list

# Clone this project
$ mkdir /opt/heorot
$ cd /opt/heorot
$ git clone https://github.com/ubccr/heorot .

# Install the API dependencies
$ cd api
$ npm i
# Install the Client dependencies
$ cd ../client
$ npm i

# Edit the config files
$ cp config.example.js config.js
$ cp ../client/src/config.example.js ../client/srv/config.js
$ vim config.js
$ vim ../client/src/config.js

# Allow port 443 binding (if applicable)
$ sudo setcap cap_net_bind_service=+ep /usr/bin/node

# Use pm2 to start the API and Client
$ pm2 start --name API ~/heorot/api/server.js --watch
~/heorot/client$ pm2 start --name client npm -- start

# save processes
$ pm2 save

### Deprecated: see prod setup for dockerized mongo install
# -- DB config --
# Enable authentication
$ sudo nano /etc/mongod.conf
  security:
    authorization: enabled # <------
$ sudo systemctl restart mongod.service

$ mongosh
# Create admin user to change user perms
$ db.createUser({ user: "admin", pwd: passwordPrompt(), roles: [{ role: "root", db: "admin" }]})
# Create api user - match the info set in the config files
$ db.createUser({ user: "api", pwd: passwordPrompt(), roles: [{ role: "readWrite", db: "dcim" }] })

```
