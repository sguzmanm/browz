const fs = require('fs');
const path = require('path');

const logger = require('./logger').newInstance('Config');

const hostConfigPath = path.join(__dirname, '../config/settings.json');
const containerConfigPath = '/tmp/config/settings.json';

let hostConfig;
let containerConfig;

const defaultConfig = {
  resemble: {
    output: {
      errorColor: {
        red: 0,
        green: 0,
        blue: 255,
      },
      errorType: 'movement',
      transparency: 0.6,
      largeImageThreshold: 0,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: 'none',
  },
};


module.exports.getHostConfig = () => {
  logger.logInfo(`Current host config: ${JSON.stringify(hostConfig)}`);
  if (hostConfig) {
    return hostConfig;
  }

  if (!fs.existsSync(hostConfigPath)) {
    hostConfig = defaultConfig;
    logger.logInfo(`Using default host config: ${JSON.stringify(defaultConfig)}`);
    return hostConfig;
  }

  hostConfig = JSON.parse(fs.readFileSync(hostConfigPath));
  logger.logInfo(`Using settings host config file ${hostConfigPath}: ${JSON.stringify(hostConfig)}`);

  return hostConfig;
};

module.exports.getContainerConfig = () => {
  logger.logInfo(`Current container config: ${JSON.stringify(containerConfig)}`);
  if (containerConfig) {
    return containerConfig;
  }

  if (!fs.existsSync(containerConfigPath)) {
    containerConfig = this.getHostConfig();
    logger.logInfo(`Using default container config: ${JSON.stringify(containerConfig)}`);
    return containerConfig;
  }

  containerConfig = JSON.parse(fs.readFileSync(containerConfigPath));
  logger.logInfo(`Using settings container config file ${containerConfigPath}: ${JSON.stringify(containerConfig)}`);

  return containerConfig;
};
