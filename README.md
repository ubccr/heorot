<h1 align="center">Heorot</h1>

<div align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/ubccr/heorot?color=56BEB8">

  <img alt="Github language count" src="https://img.shields.io/github/languages/count/ubccr/heorot?color=56BEB8">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/ubccr/heorot?color=56BEB8">

  <img alt="License" src="https://img.shields.io/github/license/ubccr/heorot?color=56BEB8">

  <!-- <img alt="Github issues" src="https://img.shields.io/github/issues/ubccr/heorot?color=56BEB8" /> -->

  <!-- <img alt="Github forks" src="https://img.shields.io/github/forks/ubccr/heorot?color=56BEB8" /> -->

  <!-- <img alt="Github stars" src="https://img.shields.io/github/stars/ubccr/heorot?color=56BEB8" /> -->
</div>

<!-- Status -->

<!-- <h4 align="center">
	🚧  Heorot 🚀 Under construction...  🚧
</h4>

<hr> -->

<br>

## :dart: About

Heorot is a companion to <a href="https://github.com/ubccr/grendel" target="_blank">Grendel</a> providing a Web-UI for managing a data center worth of nodes

<!-- ## :sparkles: Features

:heavy_check_mark: Feature 1;\
:heavy_check_mark: Feature 2;\
:heavy_check_mark: Feature 3; -->

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Node](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/docs/manual/installation/), and [Grendel](https://github.com/ubccr/grendel) installed.

## :checkered_flag: Build from source

<!-- TODO: write source build docs -->

```bash
# Install pm2 - a nodejs process manager
$ npm i -g pm2
$ pm2 list

# Clone this project
$ git clone https://github.com/ubccr/heorot heorot

# Install the API dependencies
$ cd ~/heorot/api
$ npm i
# Install the Client dependencies
$ cd ~/heorot/client
$ npm i

# Edit the config files
$ vim ~/heorot/api/config.js
$ vim ~/heorot/client/config.js

# Allow port 443 binding
$ sudo setcap cap_net_bind_service=+ep /usr/bin/node

# Use pm2 to start the API and Client
$ pm2 start --name API ~/heorot/api/server.js --watch
~/heorot/client$ pm2 start --name client npm -- start

# save processes
$ pm2 save


```

## :memo: License

This project released under the GPLv3 license . For more details, see the [LICENSE](LICENSE.md) file.

&#xa0;

<a href="#top">Back to top</a>
