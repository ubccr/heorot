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
Checkout the <a href="screenshots.MD">Screenshots</a> folder for an example of the UI

## :sparkles: Features

:heavy_check_mark: Visualizes Floor and Rack layouts \
:heavy_check_mark: Provides a beautiful UI to manage Grendel \
:heavy_check_mark: Displays node information from the Redfish API \
:heavy_check_mark: Integration of OpenMange Enterprise alerts

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Node](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/docs/manual/installation/), and [Grendel](https://github.com/ubccr/grendel) installed.

## :checkered_flag: Production build

```bash
### See quickstart.MD for a sample install & config of requirements

$ git clone https://github.com/ubccr/heorot.git

# Download node packages
$ cd heorot/api
$ npm i

# Generate an OpenSSL cert & ssh key (see api/keys/keys.MD)

# Edit the config file
$ vim config.js

### If binding to port 443:
$ sudo setcap cap_net_bind_service=+ep /usr/bin/node

# Run the webserver
$ node server.js
# Vist the hostname of your server & create a new account with "Signup"

# Don't login yet, open the mongo shell or use Atlas to edit the DB
$ mongosh -u admin -p

$ use dcim
# Ensure your username shows up
$ db.users.find()
# Update your user to 'admin' privs
$ db.users.updateOne({username: 'your_username_here'},{$set:{privileges: 'admin'}})
$ exit

### Note: all new users will have the default value of privileges: "none", they will need to have their privileges updated to either "user" or "admin" before they can use the webUI.
# As of the time of writing, "admin" allows access to the "Warranty" page, which is used to query Dell's warranty API.



```

## :memo: License

This project released under the GPLv3 license . For more details, see the [LICENSE](LICENSE.md) file.

&#xa0;

<a href="#top">Back to top</a>
