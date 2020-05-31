require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const util = require('util');
const fs = require('fs');

const writeFile = util.promisify(fs.writeFile);

const { setDate, router } = require('./snapshot-router');
const { getLogs } = require('./snapshot-log-storage');
const { getEvents } = require('./snapshot-comparator');


const {
  snapshotProcessorServerConfig, container, baseBrowser, browsers,
} = require('../../../shared/config.js').getContainerConfig();
const logger = require('../../../shared/logger').newInstance('Snapshot Processor');

const snapshotDestinationDir = container && container.snapshotDestinationDir ? container.snapshotDestinationDir : '/tmp/runs';
const port = snapshotProcessorServerConfig && snapshotProcessorServerConfig.port ? snapshotProcessorServerConfig.port : '8081';

const app = express();
app.use(bodyParser.json());


const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const ans = { error: err.message };
  res.status(400);
  res.json(ans);

  return ans;
};

module.exports.start = (dateString) => {
  // Routes
  setDate(dateString);
  app.use('/', router);
  // Middleware
  app.use(errorHandler);

  // Main action
  const server = app.listen(port, () => {
    logger.logInfo('Snapshot Server started on port...', port);
  });

  server.on('error', (error) => {
    logger.logError(`Server Error: ${error}`);
    throw error;
  });
};

const getEventWithClosestTimestamp = (log, events) => {
  const timestamp = parseInt(log.timestamp, 10);
  const browserName = log.browser;

  let closestTimestampDifference = timestamp;
  let chosenEvent;
  let browserTimestamp;

  logger.logDebug(log);
  logger.logDebug(events);
  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    logger.logDebug(event.browsers);
    const browserData = event.browsers.find((browser) => browser.name === browserName);
    // eslint-disable-next-line no-continue
    if (!browserData || !browserData.timestamp) { continue; }

    browserTimestamp = browserData.timestamp;
    if (Math.abs(timestamp - browserTimestamp) < closestTimestampDifference) {
      closestTimestampDifference = browserTimestamp;
      chosenEvent = event;
    }
  }

  logger.logDebug('Closest event to log', chosenEvent);

  return chosenEvent;
};

module.exports.writeResults = async (startDateTimestamp, startDateString, endDateString) => {
  const logs = getLogs();
  const events = getEvents();

  logs.forEach((log) => {
    logger.logDebug('Log', log);
    const chosenEvent = getEventWithClosestTimestamp(log, events); // TODO: Make more general solution
    if (!chosenEvent) {
      return;
    }

    chosenEvent.browsers.find((browser) => browser.name === log.browser).log = log;
    logger.logDebug('Modified chosen event', chosenEvent);
  });

  logger.logInfo('Console logs compared with browser events...');

  const runPath = `${snapshotDestinationDir}/${startDateString}/run.json`;
  await writeFile(runPath, JSON.stringify({
    seed: container.seed,
    startDate: startDateString,
    startTimestamp: startDateTimestamp,
    endDate: endDateString,
    baseBrowser: baseBrowser || 'chrome',
    browsers,
    events,
  }));
};
