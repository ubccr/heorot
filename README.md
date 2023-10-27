 > Dev update: Heorot is currently being re-written in GO and integrated directly into the Grendel binary. Early beta code can be compiled from [here.](https://github.com/jafurlan/grendel/tree/frontend)


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
 
## :dart: About

Heorot is a companion to [Grendel](https://github.com/ubccr/grendel) providing a Web-UI for managing a data center worth of nodes. It's focus is on improving the workflow of hardware lifecycle management, everything from importing and configuring nodes to hardware maintenance.\
Checkout the [Screenshots](screenshots.MD) file for an example of the UI.

## :sparkles: Features

:heavy_check_mark: Visualizes Floor and Rack layouts \
:heavy_check_mark: Provides an easy to use UI to manage Grendel \
:heavy_check_mark: Displays node information from the Redfish API \
:heavy_check_mark: Integration of OpenMange Enterprise alerts

## :checkered_flag: Production build

This is an example install using Docker, see the [install](INSTALL.MD) file for a "from the sources" install.

Please follow security best practices. It is recommended to only allow access to Heorot through a private internal only network.

### :white_check_mark: Requirements

> Installation of requirements will not be covered in this guide

- Docker: [docs.docker.com](https://docs.docker.com/engine/install/ubuntu/)
- Grendel: [github.com/ubccr/grendel](https://github.com/ubccr/grendel)

### Heorot setup:

```bash
# Example directory
sudo mkdir /opt/heorot
```

Replace v1.3.4 with the latest / desired version:

```bash
git clone --branch v1.3.4 --single-branch https://github.com/ubccr/heorot.git /opt/heorot
```

### Copy the configuration files:

```bash
cp /opt/heorot/api/config.example.js /opt/heorot/api/config.js && cp /opt/heorot/docker-compose.example.yml /opt/heorot/docker-compose.yml
```

### Setup the configuration files:

```bash
# Please read though the files, there are many comments!
nano /opt/heorot/docker-compose.yml
nano /opt/heorot/api/config.js
```

### Generate Certs & Keys:

The /opt/heorot/api/keys directory needs the following:

1. server.cert
2. server.key
3. switches.key (optional switch ssh private key)

```bash
# Example cert generation | Change localhost to your server's IP & region info
openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=localhost/C=US/L=New York" -keyout server.key -out server.cert
```

### Start the containers:

```bash
docker compose up -d
```

---

## :tada: Heorot should now be running!

Head to the signup page and create an account to get started

### Log files:

```bash
docker logs heorot_heorot-1
```

## Grendel Tags:

#### There are a few custom Grendel tags that can be added to customize the rack and node view shown in Heorot:

- p22 | /[a-z][0-9]{2}/
  - displays node in rack p22
- 2u, 3u, 4u | /[0-9]{1,2}u/
  - override for automatic size calcs - renders node as a multi u height chassis
- 1w, 2w | /[0-9]{1,2}w/
  - override for automatic size calcs - renders node as a multi node wide chassis
- noAPI
  - disables redfish API queries on node page
- switches:
  - Dell_OS8, Dell_OS9, Dell_OS10
    - set depending on switch OS version
  - Dell_PC3
    - specific for Dell Powerconnect 6248 - VxWorks v3.x
  - Dell_PC5
    - specific for Dell Powerconnect 7048 - VxWorks v5.x
  - Arista_EOS
    - for our core switch | TODO: add non core switch EOS queries for other versions

## :memo: License

This project released under the GPLv3 license . For more details, see the [LICENSE](LICENSE.md) file.

&#xa0;

<a href="#top">Back to top</a>
