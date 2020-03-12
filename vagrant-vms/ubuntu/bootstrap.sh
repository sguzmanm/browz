#!/bin/bash
sudo apt-get update
sudo apt-get -y upgrade

# Setup Docker
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker vagrant
sudo service docker start
docker version
sudo apt-get i-y install make

# Download git
apt-get -y install git-core

# Download Node JS
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get update
apt-get -y install nodejs
nodejs -v

# Download resemble libs
apt-get update 
apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev build-essential g++

# Clone repo
cd /tmp
git clone https://github.com/sguzmanm/thesis.git
cd ./thesis/scripts && npm install



