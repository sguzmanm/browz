require('dotenv').config();
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const compareImages = require('resemblejs/compareImages'); // Resemble

const config = require('../../../shared/config.js').getContainerConfig();
const logger = require('../../../shared/logger').newInstance('Snapshot Processor Comparator');

const containerConfig = config.container;
const snapshotDestinationDir = containerConfig && containerConfig.snapshotDestinationDir ? containerConfig.snapshotDestinationDir : '/tmp/runs';
const baseBrowser = config.baseBrowser || 'chrome';
const browserWaitingTime = config.browserWaitingResponseTime
  ? parseInt(config.browserWaitingResponseTime, 10) : 30000;

const activeBrowsers = [...config.browsers];

// Logging
const events = [];


const timeoutMap = {}; // Map: Browser(String)->Function
const imageMap = {}; // Map: Id(String)-> [Map:Browser(String)->Filenames(Array) ]

const compareSnapshots = async (original, modified, dateString) => {
  const data = await compareImages(
    await readFile(original),
    await readFile(modified),
    config.resemble,
  );

  const fileSeparation = modified.split(path.sep);
  const isBefore = original.includes('before');

  const idBasePath = `${snapshotDestinationDir}${path.sep}${dateString}${path.sep}snapshots${path.sep}${fileSeparation[fileSeparation.length - 2]}${path.sep}`;
  const comparisonPath = isBefore ? `${idBasePath}comparison_before.json` : `${idBasePath}comparison_after.json`;
  await writeFile(comparisonPath, JSON.stringify({
    resemble: {
      ...data,
    },
  }));

  const resultPath = `${idBasePath}comparison_${baseBrowser}_vs_${fileSeparation[fileSeparation.length - 1]}`;
  await writeFile(resultPath, data.getBuffer());

  logger.logDebug(`Comparison result saved at ${resultPath}`);
};

// Browser comparison of snapshots
const compareBrowsers = async (snapshotMap, dateString) => {
  const baseImages = snapshotMap[baseBrowser];

  try {
    const comparisonResults = activeBrowsers.map(async (browser) => {
      if (browser === baseBrowser) {
        return;
      }

      const stageResults = baseImages.map(async (baseBrowserImage, i) => {
        const comparableBrowserImage = snapshotMap[browser][i];
        await compareSnapshots(
          `${snapshotDestinationDir}${path.sep}${dateString}${path.sep}snapshots${path.sep}${baseBrowserImage}`,
          `${snapshotDestinationDir}${path.sep}${dateString}${path.sep}snapshots${path.sep}${comparableBrowserImage}`,
          dateString,
        );
      });

      await Promise.all(stageResults);
      logger.logDebug(`Comparison process finished between ${baseBrowser} vs ${browser}`);
    });

    await Promise.all(comparisonResults);
  } catch (error) {
    logger.logWarning('Image comparison failed!!! ', error.message, error);
  }
};

const makeIdComparison = async (id, event, dateString) => {
  if (Object.keys(imageMap[id]).length !== activeBrowsers.length) {
    return;
  }

  await compareBrowsers(imageMap[id], dateString);

  const { eventType, eventName } = event;
  events.push({
    id,
    eventType,
    eventName,
    timestamp: new Date().getTime(),
  });
};

const deactivateBrowser = async (browser, event, requestData) => {
  const index = activeBrowsers.indexOf(browser);
  activeBrowsers.splice(index, 1);
  logger.logDebug(`Deactivating browser... ${browser}`);

  if (browser === baseBrowser) {
    logger.logWarning('Base browser deactivated. Nothing more to compare');
    return;
  }

  // Check images sent by remaining browsers if complete
  const keys = Object.keys(imageMap);
  const results = keys.map(async (id) => {
    delete imageMap[id][browser]; // Remove inactive browser
    await makeIdComparison(id, event, requestData.dateString);
  });

  await Promise.all(results);
};

module.exports.registerImage = async (imageRequestBody, requestData) => {
  const {
    browser, id, eventType, eventName,
  } = imageRequestBody;
  const event = {
    eventType,
    eventName,
  };

  if (!activeBrowsers.includes(baseBrowser) || activeBrowsers.length === 1) {
    logger.logError(`There are no browsers to compare. Currently active browsers: ${activeBrowsers.length === 0 ? 'None' : activeBrowsers}`);
    throw new Error(`There are no browsers to compare. Currently active browsers: ${activeBrowsers.length === 0 ? 'None' : activeBrowsers}`);
  }

  if (!activeBrowsers.includes(browser)) {
    logger.logWarning(`Inactive browser requested: ${browser}`);
    throw new Error(`Inactive browser requested: ${browser}`);
  }

  clearTimeout(timeoutMap[browser]);

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(() => {
    deactivateBrowser(browser, event, requestData);
  }, browserWaitingTime);

  if (!imageMap[id]) {
    imageMap[id] = {};
  }

  imageMap[id][browser] = requestData.fileNames;
  await makeIdComparison(id, event, requestData.dateString);
};

module.exports.writeResults = async (startDateTimestamp, startDateString, endDateString) => {
  const runPath = `${snapshotDestinationDir}${path.sep}${startDateString}${path.sep}run.json`;
  await writeFile(runPath, JSON.stringify({
    seed: containerConfig.seed,
    startDate: startDateString,
    startTimestamp: startDateTimestamp,
    endDate: endDateString,
    baseBrowser,
    browsers: config.browsers,
    events,
  }));
};
