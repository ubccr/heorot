## MongoDB install on Ubuntu 22.04

See https://www.mongodb.com/docs/manual/installation/ for other linux distro instructions

This guide is meant to get Heorot up and running quickly, any prod deployments should follow security best practices for mongoDB & nodejs

```bash
### Note: mongoDB does not have an official ubuntu jammy release, we will using the focal repo with a manual libssl install

$ sudo apt update && sudo apt upgrade -y

# libssl
$ echo "deb http://security.ubuntu.com/ubuntu impish-security main" | sudo tee /etc/apt/sources.list.d/impish-security.list

$ sudo apt update
$ sudo apt install libssl1.1

# MongoDB
$ wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

$ sudo apt update
$ sudo apt install -y mongodb-org

$ sudo systemctl enable mongod

$ sudo vim /etc/mongod.conf
# Uncomment the security section & add "authorization: enabled"
security:
  authorization: enabled

$ sudo systemctl start mongod

$ mongosh
$ use admin

# Create mongo Admin user
$ db.createUser({ user: "admin", pwd: passwordPrompt(), roles: [{ role: "root", db: "admin" }]})
$ exit

# Exit and login with your new user & password
$ mongosh -u admin
$ use dcim
# Create API user - This user & password needs to go into the config.js file in heorot/api/
$ db.createUser({user: "api" , pwd: passwordPrompt() , roles: [{ role: "readWrite" , db: "dcim"}]})
$ exit

# Continue to README.md for Heorot config
```

## Node.js install

Quick nodejs install

```bash
$ curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
$ sudo bash nodesource_setup.sh
$ sudo apt install nodejs
```
