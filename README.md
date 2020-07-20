# Automated Snapshot Browser Comparator

Thesis project for Systems Engineering major at Universidad de Los Andes, aiming to provide a tool for web developers to test their web application in different browsers and see the differences that arise between them. By using our own docker image hosted on [Docker Hub](https://hub.docker.com/repository/docker/sguzmanm/linux_cypress_tests) we offer a controlled environment for executing headless browsers that will test your web app and give you results.

## Getting Started

Currently our project runs on a local machine, therefore you will need to execute everything on your computer.

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

### Installing and running

All you need to do is go to the project and install the dependencies using npm

```
cd browz
npm install
```

After that, just run

```
npm run browz -- <Path to web app project> <Destination of screenshots of browsers> 
```

- The first param you specify is the path where your web app project is. This projects can only be composed of HTML, JS and CSS files with graphic assets (videos, images, etc). We are not supporting applications that are processed by the server (SSR).
- The second param required is the destination where the screenshots taken of the browsers are stored. We are performing a throughful exploration of your web application and taking screenshots at every action done to later compare the images against the execution of a base browser you determine with our environmental variables.

> The code for the docker container can be found at `browser-execution` and can be easily run by using `node index.js`

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

This project has tow execution machines: The host machine, which triggers the container and generates the report, and the docker container, which executes the image comparison.

### Host Machine


### Docker Container

- [Cypress](https://www.cypress.io/): Automated headless browser execution and screenshots
- [Express](https://expressjs.com/): Fast web framework for NodeJS REST APIs. Creation of endpoint to upload images.
- [Multer](https://github.com/expressjs/multer): Express Middleware for uploading multipart/form-date, meaning images and params.
- [Node Static](https://www.npmjs.com/package/node-static): JS Server for static files, used for launching the files for the web app folder passed as param.
- [Resemble JS](https://rsmbl.github.io/Resemble.js/): Image analysis and comparison between screenshots.
- [Faker](https://github.com/marak/Faker.js/): Generate random data for filling information inside webpage
- [Seed Random](https://github.com/davidbau/seedrandom): Generate unique seeds for the IDs of the images to compare using snapshots.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Sergio Guzmán** - [sguzmanm](https://github.com/sguzmanm)
- **Julián Manrique** - [Sxubas](https://github.com/Sxubas)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/sguzmanm/browz/blob/master/LICENSE.md) file for details

## Acknowledgments

- Cypress monkey was provided by [The SW Design Lab](https://github.com/TheSoftwareDesignLab/monkey-cypress)
