const path = require('path');
const fs = require('fs');

// Setup logging
const { setLevelWithFlags, newInstance } = require('../shared/logger');

setLevelWithFlags(process.argv);
const logger = newInstance();

// Two main params, http source and image destination
const { setupDocker, runDocker, killDocker } = require('../src/docker-manager/docker-manager');
const { createReportData } = require('../src/report-manager/report-manager');

const EMPTY_DIR_MSG = 'Empty dir provided for server:';

const executionArguments = process.argv.filter((el) => !el.startsWith('--')); // Filter flags
const httpSource = executionArguments[2];
if (!httpSource || httpSource.trim() === '') {
  // eslint-disable-next-line no-undef
  logger.logError(EMPTY_DIR_MSG, 'Http');
  process.exit(1);
}

let imagesDestination = executionArguments[3];
if (!imagesDestination || imagesDestination.trim() === '') {
  imagesDestination = path.join(__dirname, '../runs');
  if (!fs.existsSync(imagesDestination)) {
    fs.mkdirSync(imagesDestination);
  }
}

const finishProcess = async (success) => {
  try {
    await killDocker();
  } catch (error) {
    logger.logError('Process finished without stopping container');
  }

  if (success) {
    process.exit(0);
  }

  process.exit(1);
};

const main = async () => {
  try {
    logger.logInfo('-----Setup Container-----');
    await setupDocker();
    logger.logInfo('----Run Container-------');
    await runDocker(httpSource, imagesDestination, logger.level);
    logger.logInfo('-----Create Report--------');
    await createReportData(imagesDestination);
    logger.logInfo('-----Finish process-------');
    await finishProcess(true);
  } catch (error) {
    logger.logError('Error running container code', error);
    throw error;
  }
};

process.on('unhandledRejection', (error) => {
  // Won't execute
  logger.logWarning('-----Finish process with unhandled error-------');
  logger.logError(error);
  finishProcess(false);
});


try {
  main();
} catch (error) {
  logger.logWarning('-----Finish process with error-------');
  logger.logError(error);
  finishProcess(false);
}
