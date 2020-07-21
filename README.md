# Browz

Browz is a thesis project for Systems Engineering major at Universidad de Los Andes, aiming to provide a tool for web developers to test their web application in different browsers and see the differences that arise between them. By using our own docker image hosted on [Docker Hub](https://hub.docker.com/repository/docker/sguzmanm/linux_cypress_tests) we offer a controlled environment for executing headless browsers that will test your web app and give you results.

## Getting Started

Currently our project runs locally, therefore you will need to execute everything on your computer.

### Prerequisites

- Node JS and NPM: Installation instructions can be found [here](https://nodejs.org/en/download/). Once installed check your version by running:

```
npm --version
node --version
```

> If you wanna run the execution code of the container locally we recommend having a Node JS Version >= 10

- Docker: Installation instructions can be found [here](https://docs.docker.com/install/). Again, once installed check your version by running:

```
docker --version
```

If you have any trouble installing docker you can always turn to virtualization alternatives, like [Docker Machine](https://docs.docker.com/machine/concepts/), [Vagrant](https://app.vagrantup.com/nfqlt/boxes/docker) or even cloud providers including [Amazon](https://aws.amazon.com/es/ec2/)

### Installing and running from source

First, clone the project's repo and install the dependencies using npm

```
git clone https://github.com/sguzmanm/browz.git
cd browz
npm install
```

After that, just run

```
npm run browz -- <path-to-web-app> <screenshots-destination>
```

- `path-to-web-app` is the path where the built files of the web app to test are. Built files must be HTML, JS and CSS files, however, they may also include other assets (videos, images, etc). Currently we do not support applications that are server side rendered.
- `screenshots-destination` is the path where the screenshots taken of the tests will be stored. We explore the web application and take screenshots at every action done to later compare the images against the execution of the other browsers.

### Env vars

Most of the project is configured by using env variables. Here is a brief example of each one we used:

```
LINUX_CONTAINER=sguzmanm/linux_cypress_tests:latest
HTTP_PORT=8080
HTTP_APP_DIR=/app
IMAGE_PORT=8081
SNAPSHOT_DESTINATION_DIR=/screenshots
BROWSER_RESPONSE_WAITING_TIME=30000
BASE_BROWSER=electron
```

## Built With

This project has two execution 'runtimes':
 - The host machine, which triggers the testing container and hosts the UI files locally to visualize the test results.
 - The docker container, which does all the heavy lifting to do the cross-browser tests.

### Host
- [Vue.js](https://vuejs.org/): Awesome javascript framework to build user interfaces.

### Docker Container

- [Cypress](https://www.cypress.io/): Testing software that we use to do automated headless browser execution
- [Express](https://expressjs.com/): Fast web framework to create REST APIs. Internally we set up a REST API to communicate the browser instances results.
- [Resemble.js](https://rsmbl.github.io/Resemble.js/): Image analysis and comparison between screenshots.
- [Node Static](https://www.npmjs.com/package/node-static): JS Server for static files, used for hosting the built files of the tested web app.
- [Faker](https://github.com/marak/Faker.js/): Generate random data for filling information inside tests.

## Contributing

We don't have any guidelines to submit a pull request. Feel free to create an issue or a pull request.

## Authors

- **Sergio Guzmán** - [sguzmanm](https://github.com/sguzmanm)
- **Julián Manrique** - [Sxubas](https://github.com/Sxubas)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/sguzmanm/browz/blob/master/LICENSE.md) file for details

## Acknowledgments

- Cypress monkey was provided by [The SW Design Lab](https://github.com/TheSoftwareDesignLab/monkey-cypress)
