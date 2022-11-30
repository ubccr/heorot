## :checkered_flag: Production build

This is an opinionated, reference guide to installing Heorot, please follow security best practices.

### :white_check_mark: Requirements

> Installation of requirements will not be covered in this guide

- Git: [git-scm.com](https://git-scm.com)
- Node: [nodejs.org](https://nodejs.org/en/)
- Docker: [docs.docker.com](https://docs.docker.com/engine/install/ubuntu/)
- Grendel: [github.com/ubccr/grendel](https://github.com/ubccr/grendel)

### Heorot setup:

> This guide will assume Heorot will be run as the grendel user

```bash
$ sudo mkdir /opt/heorot

# Ensure directory is accessable to the grendel user
$ sudo chown ubuntu:grendel -R /opt/heorot
$ chmod g+s -R /opt/heorot

# replace v1.3.0 with the latest / desired version
$ git clone --branch v1.3.0 --single-branch https://github.com/ubccr/heorot.git /opt/heorot
```

### Install node Packages:

```bash
$ cd /opt/heorot/api
$ npm i
```

### Configure and start Mongo container:

```bash
$ cp /opt/heorot/docker-compose.example.yml /opt/heorot/docker-compose.yml
# Change the default password:
$ nano /opt/heorot/docker-compose.yml

$ docker compose up -d
```

### Setup the configuration file:

```bash
$ cp /opt/heorot/api/config.example.js /opt/heorot/api/config.js
$ nano /opt/heorot/api/config.js
```

### Generate Certs & Keys:

The /opt/heorot/api/keys directory needs the following:

1. server.cert
2. server.key

```bash
$ cd /opt/heorot/api/keys
# Example cert generation | Change localhost to your server's IP & region info
$ openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=localhost/C=US/L=New York" -keyout server.key -out server.cert

# Ensure keys are readable by grendel user
$ ls -l
$ chmod 640 *
```

### Setup the service file:

```bash
# Copy the service files & edit if necessary
$ sudo cp /opt/heorot/heorot.service /etc/systemd/system/
$ sudo nano /etc/systemd/system/heorot.service

$ sudo systemctl enable heorot.service
$ sudo systemctl start heorot.service
```

---

## :tada: Heorot should now be running!

Head to the signup page and create an account to get started

### Log files:

```bash
 tail /var/log/heorot.log
```
