const path = require('path');
const fs = require('fs');

// Setup logging
const { newInstance } = require('../shared/logger');


// Two main params, http source and image destination
const { setupDocker, runDocker, killDocker } = require('../src/docker-manager/docker-manager');
const { createReportData, visualize } = require('../src/report-manager/report-manager');

const flags = process.argv.filter((el) => el.startsWith('--'));
const logger = newInstance();
logger.setLevelWithFlags(flags);

const EMPTY_DIR_MSG = 'Empty dir provided for server:';

const parseSource = (rawSource) => {
  if (rawSource.startsWith('/')) { // TODO: Define absolute path for windows
    return rawSource; // Absolute path
  }

  return `${process.cwd()}/${rawSource}`;
};

const executionArguments = process.argv.filter((el) => !el.startsWith('--')); // Filter flags
const rawHttpSource = executionArguments[2];
if (!rawHttpSource || rawHttpSource.trim() === '') {
  // eslint-disable-next-line no-undef
  logger.logError(EMPTY_DIR_MSG, 'Http');
  process.exit(1);
}

const httpSource = parseSource(rawHttpSource);

let imagesDestination = executionArguments[3];
if (imagesDestination) {
  imagesDestination = parseSource(imagesDestination);
}

if (!imagesDestination || imagesDestination.trim() === '') {
  imagesDestination = path.join(__dirname, '../runs');
  if (!fs.existsSync(imagesDestination)) {
    fs.mkdirSync(imagesDestination);
  }
}

const shouldSkipVisualization = flags.includes('--skip-report');

const finishProcess = async (success) => {
  try {
    await killDocker();
  } catch (error) {
    logger.logError('Process finished without stopping container');
  }

  if (!success) {
    process.exit(1);
  }
};

const main = async () => {
  try {
    logger.logInfo('-----Setup Container-----');
    await setupDocker();
    logger.logInfo('----Run Container-------');
    await runDocker(httpSource, imagesDestination, logger.level);
    logger.logInfo('-----Create Report--------');
    await createReportData(imagesDestination);
    logger.logInfo('-----Stop docker container-------');
    await finishProcess(true);

    if (shouldSkipVisualization) {
      return;
    }

    logger.logInfo('-----Visualize report information-------');
    visualize();
  } catch (error) {
    logger.logError(`Error during report process: ${error}`);
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
