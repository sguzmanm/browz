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
  snapshotProcessorServerConfig, container, baseBrowser, browsers, resemble,
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

  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    const browserData = event.browsers.find((browser) => browser.name === browserName);
    // eslint-disable-next-line no-continue
    if (!browserData || !browserData.timestamp) { continue; }

    browserTimestamp = browserData.timestamp;
    if (Math.abs(timestamp - browserTimestamp) < closestTimestampDifference) {
      closestTimestampDifference = browserTimestamp;
      chosenEvent = event;
    }
  }

  return chosenEvent;
};

module.exports.writeResults = async (startDateTimestamp, startDateString, endDateString) => {
  const logs = getLogs();
  const events = getEvents();

  const logsOutput = {}; // Store the whole output of te different browsers

  logs.forEach((log) => {
    const { browser, messages, ...storedLog } = log;
    storedLog.message = messages.join('\n');

    if (!logsOutput[browser]) {
      logsOutput[browser] = [];
    }

    logsOutput[browser].push(storedLog);

    const chosenEvent = getEventWithClosestTimestamp(log, events); // TODO:Make more generalsolution
    if (!chosenEvent) {
      return;
    }

    chosenEvent.browsers.find((eventBrowser) => eventBrowser.name === browser).log = log;
  });

  logger.logInfo('Console logs compared with browser events...');

  const runBasePath = `${snapshotDestinationDir}/${startDateString}`;
  await writeFile(`${runBasePath}/run.json`, JSON.stringify({
    seed: container.seed,
    numEvents: container.numEvents ? container.numEvents : 30,
    startDate: startDateString,
    startTimestamp: startDateTimestamp,
    endDate: endDateString,
    baseBrowser: baseBrowser || 'chrome',
    browsers,
    events,
    runDetails: {
      resemble,
    },
  }));

  await writeFile(`${runBasePath}/log.json`, JSON.stringify(logsOutput));
};
