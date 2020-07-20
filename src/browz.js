const fs = require('fs');
const path = require('path');
const { newInstance } = require('../shared/logger');
const { createReportData, visualize } = require('./report-manager/report-manager');
const { setupDocker, runDocker, killDocker } = require('./docker-manager/docker-manager');


const finishProcess = async (logger, success) => {
  try {
    await killDocker();
  } catch (error) {
    logger.logError('Process finished without stopping container');
  }

  if (!success) {
    process.exit(1);
  }
};

const init = (logger, rawSnapshotsDestination) => {
  process.on('unhandledRejection', (error) => {
    logger.logWarning('-----Finish process with unhandled error-------');
    logger.logError(error);
    finishProcess(logger, false);
  });

  let snapshotsDestination = '';

  if (!rawSnapshotsDestination || rawSnapshotsDestination.trim() === '') {
    snapshotsDestination = path.join(__dirname, '../runs');
    if (!fs.existsSync(snapshotsDestination)) {
      fs.mkdirSync(snapshotsDestination);
    }
  }

  return snapshotsDestination;
};

module.exports = {
  main: async ({
    shouldSkipVisualization,
    shouldOnlyVisualize,
    httpSource,
    rawSnapshotsDestination,
    logger = newInstance(),
  }) => {
    const snapshotsDestination = init(logger, rawSnapshotsDestination);

    if (shouldOnlyVisualize) {
      visualize();
      return;
    }

    try {
      logger.logInfo('-----Setup Container-----');
      await setupDocker();
      logger.logInfo('----Run Container-------');
      await runDocker(httpSource, snapshotsDestination, logger.level);
      logger.logInfo('-----Create Report--------');
      const latestRun = await createReportData(httpSource, snapshotsDestination);
      logger.logInfo('-----Stop docker container-------');
      await finishProcess(logger, true);

      if (shouldSkipVisualization) {
        return;
      }

      logger.logInfo('-----Visualize report information-------');
      visualize(latestRun);
    } catch (error) {
      logger.logError(`Error during report process: ${error}`);
      throw error;
    }
  },
};
