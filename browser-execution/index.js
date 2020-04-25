const dotenv = require('dotenv');

dotenv.config();

const { startServers, writeResults } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');
const logger = require('../shared/logger').newInstance('Browser Execution');

const calculateDateString = () => {
  const date = new Date();
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  return date.toLocaleDateString('es-CO', dateOptions).replace(':', '');
};


const main = async () => {
  try {
    const startDateString = calculateDateString();

    logger.logInfo('Start servers...');
    await startServers(startDateString);

    logger.logInfo('Start app exploration...');
    await exploreApp();

    const endDateString = calculateDateString();

    logger.logInfo('Write results...');
    await writeResults(startDateString, endDateString);
    logger.logInfo('Ending browser execution....');
  } catch (error) {
    logger.logError(error);
  }
};

main();
