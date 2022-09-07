<h1 align="center">Heorot</h1>

<div align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/ubccr/heorot?color=1565c0">

  <img alt="Github language count" src="https://img.shields.io/github/languages/count/ubccr/heorot?color=1565c0">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/ubccr/heorot?color=1565c0">

  <img alt="License" src="https://img.shields.io/github/license/ubccr/heorot?color=1565c0">

  <!-- <img alt="Github issues" src="https://img.shields.io/github/issues/ubccr/heorot?color=1565c0" /> -->

  <!-- <img alt="Github forks" src="https://img.shields.io/github/forks/ubccr/heorot?color=1565c0" /> -->

  <!-- <img alt="Github stars" src="https://img.shields.io/github/stars/ubccr/heorot?color=1565c0" /> -->
</div>

<!-- Status  -->
<!-- <hr> -->
 <!-- <h2 align="center">
	🚧  Heorot is under construction...  🚧
</h2> -->

<hr>

## :dart: About

Heorot is a companion to [Grendel](https://github.com/ubccr/grendel) providing a Web-UI for managing a data center worth of nodes. It's focus is on improving the workflow of hardware lifecycle management, everything from importing and configuring nodes to hardware maintenance.\
Checkout the [Screenshots](screenshots.MD) file for an example of the UI.

## :sparkles: Features

:heavy_check_mark: Visualizes Floor and Rack layouts \
:heavy_check_mark: Provides an easy to use UI to manage Grendel \
:heavy_check_mark: Displays node information from the Redfish API \
:heavy_check_mark: Integration of OpenMange Enterprise alerts

## :white_check_mark: Requirements

> Installation of requirements will not be covered in this guide

- Git: [git-scm.com](https://git-scm.com)
- Node: [nodejs.org](https://nodejs.org/en/)
- MongoDB: [mongodb.com](https://mongodb.com/docs/manual/installation/)
- Grendel: [github.com/ubccr/grendel](https://github.com/ubccr/grendel)

## :checkered_flag: Production build

This is an opinionated, reference guide to installing Heorot, please follow security best practices.

### Heorot setup:

> This guide will assume Heorot will be run as the grendel user

```bash
$ sudo mkdir /opt/heorot

# Ensure directory is accessable to the grendel user
$ sudo chown ubuntu:grendel -R /opt/heorot
$ chmod g+s -R /opt/heorot

$ git clone https://github.com/ubccr/heorot.git /opt/heorot
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
3. bmc.key

```bash
$ cd /opt/heorot/api/keys
# Change localhost to your server's IP & region info
$ openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=localhost/C=US/L=New York" -keyout server.key -out server.cert

$ ssh-keygen -f bmc.key

# Ensure keys are readable by grendel user
$ ls -l
$ chmod 640 *
```

### Setup the service file:

```bash
# Copy the service files & edit it if necessary
$ sudo cp /opt/heorot/heorot.service /etc/systemd/system/
$ nano /etc/systemd/system/heorot.service

$ sudo systemctl enable heorot.service
$ sudo systemctl start heorot.service
```

---

## :tada: Heorot should now be running!

You can access the dev Web UI at https://_your_ip_here_

### MongoDB Initialization:

> :warning: Ubuntu 22.04 does not have a mongosh install candidate, I advise using [MongoDB Compass](https://www.mongodb.com/products/compass) instead

1. Head to https://_your_ip_here_/#/Signup and create an Account
2. Login to MongoDB and set your user's privileges to "admin"

### Log files:

```bash
 tail -f /var/log/heorot.log
```

## :memo: License

This project released under the GPLv3 license . For more details, see the [LICENSE](LICENSE.md) file.

&#xa0;

<a href="#top">Back to top</a>
