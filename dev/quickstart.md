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
