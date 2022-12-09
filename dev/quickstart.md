# Dev Environment Setup:

### Requierments:

- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- [Grendel](https://github.com/ubccr/grendel)

Clone the repo into a folder of your choice then navigate to that directory.

Make sure your files and directories are owned by uid/gid 1000, otherwise you will get permission errors when they are bind mounted to the container

```bash
cp api/config.example.js api/config.js && cp client/src/config.example.js client/src/config.js && cp dev/docker-compose.example.yml dev/docker-compose.yml
```

Edit these files with your preferred text editor, be sure to change the DB password and set the api/config.js variables to match your dev environment:

```bash
api/config.js:
config.environment = "dev"
config.origin = "http://localhost:3000"

client/config.js:
apiUrl: `https://localhost:443`
```

Install packages:

```bash
cd api
npm i
cd ../client
npm i
```

### Generate Certs & Keys:

The api/keys directory needs the following:

1. server.cert
2. server.key
3. switches.key (optional switch ssh private key)

```bash
# Example cert generation | Change localhost to your server's IP & region info
openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=localhost/C=US/L=New York" -keyout server.key -out server.cert
```

Then you can start up the containers. The api & client directories are bind mounted to the containers so any changes will hot reload the client & api

```bash
cd /dev
docker compose up -d --build
```

https://localhost:443/#/ will take you to the static UI served by Express.

Example: Navigate to https://localhost:443/grendel for the grendel api route.

http://localhost:3000 will take you to the development react UI

---

### Build for production:

> Make sure to change the client/config.js file back to:

```bash
export const apiConfig = {
  apiUrl: `https://${window.location.host}`,
}
```

Then:

```bash
cd client
npm run build
rm -rd ../api/build
mv build ../api/build
```

Now you can test the new prod UI at https://localhost:443/#/
`bash`

# \*\*\*OLD:

# Dev Environment Setup:

> :warning: This guide is written for Ubuntu 22.04 LTS

## :white_check_mark: Requirements:

### Install Node:

> Version 18 LTS is recommended

```bash
$ curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

### Install Docker: [docs.docker.com](https://docs.docker.com/engine/install/ubuntu/)

### Install Grendel: [github.com/ubccr/grendel](https://github.com/ubccr/grendel)

---

## :checkered_flag: Setup Heorot:

```bash
$ mkdir /opt/heorot
$ git clone https://github.com/ubccr/heorot.git /opt/heorot

# Ensure directory is accessable to the grendel user
$ chown -R ubuntu:grendel /opt/heorot
$ chmod g+s -R /opt/heorot
```

#### Install node Packages:

```bash
$ cd /opt/heorot/api
$ npm i

$ cd /opt/heorot/client
$ npm i
```

#### Configure and start Mongo container:

```bash
$ cp /opt/heorot/docker-compose.example.yml /opt/heorot/docker-compose.yml
# Change the default password:
$ nano /opt/heorot/docker-compose.yml

$ docker compose up -d
```

#### Setup the configuration files:

```bash
# API:
# Note: If you want to access the API without auth you can change the config.environment variable
$ cp /opt/heorot/api/config.example.js /opt/heorot/api/config.js
$ nano /opt/heorot/api/config.js

# Client:
$ cp /opt/heorot/client/src/config.example.js /opt/heorot/client/src/config.js
$ nano /opt/heorot/client/src/config.js
```

#### Generate Cert:

```bash
$ cd /opt/heorot/api/keys
# Change localhost to your server's IP & region info
$ openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=localhost/C=US/L=New York" -keyout server.key -out server.cert

# Ensure keys are readable by grendel user
$ ls -l
$ chmod 640 *
```

#### Setup the service files:

```bash
# Copy the service files & edit them if necessary
$ cp /opt/heorot/dev/dev-heorot-api.service /etc/systemd/system/
$ cp /opt/heorot/dev/dev-heorot-client.service /etc/systemd/system/

$ sudo systemctl enable dev-heorot-api.service
$ sudo systemctl enable dev-heorot-client.service

$ sudo systemctl start dev-heorot-api.service
$ sudo systemctl start dev-heorot-client.service
```

---

## :tada: Heorot should now be running!

You can access the dev Web UI at http://localhost:3000 and the API at https://localhost/_your_route_

### Log files:

```bash
 tail -f /var/log/dev-heorot-api.log
 tail -f /var/log/dev-heorot-client.log
```
