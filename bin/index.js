#!/usr/bin/env node

const Browz = require('../src/browz');
const { killDocker } = require('../src/docker-manager/docker-manager');
const { setLevelWithFlags, newInstance } = require('../shared/logger');

// Setup arguments
const flags = process.argv.filter((el) => el.startsWith('--'));
setLevelWithFlags(flags);
const executionArguments = process.argv.filter((el) => !el.startsWith('--')); // Filter flags

const shouldSkipVisualization = flags.includes('--skip-report');
const shouldOnlyVisualize = flags.includes('--visualize');

const logger = newInstance();

const parseSource = (rawSource) => {
  if (shouldOnlyVisualize) {
    return rawSource;
  }

  if (rawSource.startsWith('/')) { // TODO: Define absolute path for windows
    return rawSource; // Absolute path
  }

  return `${process.cwd()}/${rawSource}`;
};

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

const rawHttpSource = executionArguments[2];
if (!shouldOnlyVisualize && (!rawHttpSource || rawHttpSource.trim() === '')) {
  logger.logError('Empty dir provided for http server');
  process.exit(1);
}

const httpSource = parseSource(rawHttpSource);

let rawSnapshotsDestination = executionArguments[3];
if (rawSnapshotsDestination) {
  rawSnapshotsDestination = parseSource(rawSnapshotsDestination);
}

Browz.main({
  shouldSkipVisualization,
  shouldOnlyVisualize,
  httpSource,
  rawSnapshotsDestination,
  logger,
}).catch((error) => {
  logger.logWarning('-----Finish process with error-------');
  logger.logError(error);
  finishProcess(false);
});
