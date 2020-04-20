const dotenv = require('dotenv');

dotenv.config();

const { startServers } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');
const logger = require('../shared/logger').newInstance('Browser Execution');


const main = async () => {
  try {
    logger.logInfo('Start dev servers');
    await startServers();
    logger.logInfo('Start app exploration');
    await exploreApp();
  } catch (error) {
    logger.logError(error);
  }
};

main();
