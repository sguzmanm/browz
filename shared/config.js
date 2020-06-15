const fs = require('fs');
const path = require('path');

const logger = require('./logger').newInstance('Config');
const { browsers } = require('./browsers');

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
      errorType: 'flat',
      transparency: 0.6,
      largeImageThreshold: 0,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: 'none',
  },
};

const defaultActiveBrowsers = [browsers.CHROME, browsers.FIREFOX];

module.exports.getHostConfig = () => {
  logger.logDebug(`Current host config: ${JSON.stringify(hostConfig)}`);
  if (hostConfig) {
    return hostConfig;
  }

  if (!fs.existsSync(hostConfigPath)) {
    hostConfig = defaultConfig;
    logger.logDebug(`Using default host config: ${JSON.stringify(defaultConfig)}`);
    return hostConfig;
  }

  hostConfig = JSON.parse(fs.readFileSync(hostConfigPath));
  logger.logDebug(`Using settings host config file ${hostConfigPath}: ${JSON.stringify(hostConfig)}`);

  return hostConfig;
};

const cleanBrowsers = (configBrowsers) => {
  let cleanedBrowsers = [];
  const browserValues = Object.values(browsers);
  logger.logDebug(`Browser map ${browserValues}`);
  configBrowsers.forEach((browser) => {
    logger.logDebug(`Getting browser ${browser} inside ${browserValues}`);
    const lowerCaseBrowser = browser.trim().toLowerCase();
    if (browserValues.includes(lowerCaseBrowser)) {
      cleanedBrowsers.push(lowerCaseBrowser);
    }
  });

  if (cleanedBrowsers.length === 0) {
    cleanedBrowsers = defaultActiveBrowsers;
  }

  logger.logDebug('Result', cleanedBrowsers);
  return cleanedBrowsers;
};

module.exports.getContainerConfig = () => {
  logger.logDebug(`Current container config: ${JSON.stringify(containerConfig)}`);
  if (containerConfig) {
    return containerConfig;
  }

  if (!fs.existsSync(containerConfigPath)) {
    containerConfig = this.getHostConfig();
    containerConfig.browsers = cleanBrowsers(containerConfig.browsers);
    logger.logDebug(`Using default container config: ${JSON.stringify(containerConfig)}`);
    return containerConfig;
  }

  containerConfig = JSON.parse(fs.readFileSync(containerConfigPath));
  containerConfig.browsers = cleanBrowsers(containerConfig.browsers);
  logger.logDebug(`Using settings container config file ${containerConfigPath}: ${JSON.stringify(containerConfig)}`);

  return containerConfig;
};
