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

Heorot is a companion to <a href="https://github.com/ubccr/grendel" target="_blank">Grendel</a> providing a Web-UI for managing a data center worth of nodes.
Checkout the <a href="screenshots.MD">Screenshots</a> file for an example of the UI

## :sparkles: Features

:heavy_check_mark: Visualizes Floor and Rack layouts \
:heavy_check_mark: Provides a beautiful UI to manage Grendel \
:heavy_check_mark: Displays node information from the Redfish API \
:heavy_check_mark: Integration of OpenMange Enterprise alerts

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Node](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/docs/manual/installation/), and [Grendel](https://github.com/ubccr/grendel) installed.
See quickstart.MD for a sample install & config of requirements

## :checkered_flag: Production build

```bash
# Preferred install directory is /opt/heorot
# User who owns the node process will need to be in Grendel group
$ mkdir /opt/heorot
$ cd /opt/heorot
$ git clone https://github.com/ubccr/heorot.git .

# Download node packages
$ cd heorot/api
$ npm i

# Generate an OpenSSL cert & ssh key (see api/keys/keys.MD)

# Edit the config file
$ cp config.example.js config.js
$ vim config.js

### If binding to port 443:
$ sudo setcap cap_net_bind_service=+ep /usr/bin/node

# Run the webserver (you can also use the heorot.service file)
$ node server.js
# Vist the hostname of your server & create and "Signup"


# Don't login yet, open the mongo shell or use Compass to edit the DB
### As of writing: Ubuntu 22.04 does not have a mongosh install repo, I suggest using MongoDB's Compass app

# Go to the dcim table, then "users" collection, then edit the "privileges" line from "none" to "admin"
# Allowed values are "none", "admin", "user"
# admin: allows access to manage users from the UI & query Dell's Warranty API
# user: general access to all grendel functions
# none: can login but will not be able to get any node information



# Mongosh command line reference:
$ mongosh -u admin -p

$ use dcim
# Ensure your username shows up
$ db.users.find()
# Update your user to 'admin' privs
$ db.users.updateOne({username: 'your_username_here'},{$set:{privileges: 'admin'}})
$ exit





```

## :memo: License

This project released under the GPLv3 license . For more details, see the [LICENSE](LICENSE.md) file.

&#xa0;

<a href="#top">Back to top</a>
