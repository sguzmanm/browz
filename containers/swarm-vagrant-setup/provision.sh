#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker vagrant
sudo service docker start
docker version
