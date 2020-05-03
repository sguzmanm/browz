require('dotenv').config();

const { startServers, writeResults } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');
const { setLevel, newInstance } = require('../shared/logger');

setLevel(process.env.LEVEL);
const logger = newInstance('Browser Execution');

const calculateDateString = (date) => {
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
    const startDate = new Date();
    const startDateString = calculateDateString(startDate);

    logger.logInfo(`Start servers... at ${startDateString}`);
    await startServers(startDateString);

    logger.logInfo('Start app exploration...');
    await exploreApp();

    const endDateString = calculateDateString(new Date());

    logger.logInfo('Write results...');
    await writeResults(startDate.getTime(), startDateString, endDateString);
    logger.logInfo('Ending browser execution....');

    process.exit(0);
  } catch (error) {
    logger.logError(error);
    process.exit(1);
  }
};

main();
