require('dotenv').config();
const Cypress = require('cypress');
const logger = require('../../../shared/logger').newInstance('Cypress Handler');

const path = (relativePath) => `${__dirname}/${relativePath}`;
const containerConfig = require('../../../shared/config.js').getContainerConfig();

const baseConfig = {
  baseUrl: containerConfig.baseUrl ? containerConfig.baseUrl : 'http://localhost:8080',
  integrationFolder: path('.'),
  chromeWebSecurity: false,
  pluginsFile: path('cypress_plugins.js'),
  fixturesFolder: false,
  supportFile: false,
  testFiles: path('*.spec.js'),
  video: false,
  trashAssetsBeforeRuns: false,
};

const baseOptions = {
  /* browser: 'chrome' | 'firefox' | 'electron' */
  headless: true,
  spec: path('./exploration.spec.js'),
  configFile: false,
  record: false,
};

const browserOptions = (browser) => {
  const date = new Date();
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const dateString = date.toLocaleDateString('es-CO', dateOptions);

  const config = {
    ...baseConfig,
    videosFolder: path(`runs/${dateString}/${browser}/videos`),
    screenshotsFolder: path(`runs/${dateString}/${browser}/screenshots`),
    env: {
      seed: containerConfig.seed,
      events: containerConfig.numEvents,
    },
  };

  return {
    browser,
    config,
    ...baseOptions,
    port: 9222,
  };
};

module.exports.cypressHandler = async () => {
  logger.logInfo('Starting cypress exploration...');

  const cypressRuns = [
    // Cypress.run(browserOptions('chrome')),
    Cypress.run(browserOptions('firefox')),
  ];

  try {
    await Promise.all(cypressRuns);
  } catch (error) {
    logger.logError(`Handler error: ${error}`);
    throw error;
  }

  logger.logInfo('Finished cypress exploration');
};
