require('dotenv').config();
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const compareImages = require('resemblejs/compareImages'); // Resemble

const config = require('../../../shared/config.js').getContainerConfig();
const { browsers } = require('../../../shared/browsers');
const logger = require('../../../shared/logger').newInstance('Snapshot Processor Browser Control');

const containerConfig = config.container;
const imagePath = containerConfig && containerConfig.snapshotDestinationDir ? containerConfig.snapshotDestinationDir : '/tmp/runs';
const baseBrowser = config.baseBrowser || 'chrome';
const browserWaitingTime = config.browserWaitingResponseTime
  ? parseInt(config.browserWaitingResponseTime, 10) : 30000;

// Modify this var to take into account active browsers
const activeBrowsers = [browsers.FIREFOX, browsers.CHROME];
// Logging
const startBrowsers = activeBrowsers;
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

  const idBasePath = `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${fileSeparation[fileSeparation.length - 2]}${path.sep}`;
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

  const comparableBrowsers = [...activeBrowsers];
  const spliceIndex = comparableBrowsers.indexOf(baseBrowser);
  comparableBrowsers.splice(spliceIndex, 1);

  // FIXME: Fix await inside loop
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const browser of comparableBrowsers) {
      logger.logDebug(`Compare ${baseBrowser} vs ${browser}`);
      for (let i = 0; i < baseImages.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const baseBrowserImage = baseImages[i];
        const comparableBrowserImage = snapshotMap[browser][i];
        compareSnapshots(
          `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${baseBrowserImage}`,
          `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${comparableBrowserImage}`,
          dateString,
        );

        logger.logDebug(`Comparison done between ${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${baseImages[i]} and ${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${snapshotMap[browser][i]}`);
      }
    }
  } catch (error) {
    logger.logWarning('Image comparison failed!!! ', error.message, error);
    throw new Error('Image comparison failed!!! ', error.message, error);
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
  logger.logDebug('Deactivating browser...', browser);
  if (browser === baseBrowser) {
    logger.logError('Base browser deactivated. Nothing more to compare');
    throw new Error('Base browser deactivated. Nothing more to compare');
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
  const runPath = `${imagePath}${path.sep}${startDateString}${path.sep}run.json`;
  await writeFile(runPath, JSON.stringify({
    seed: containerConfig.seed,
    startDate: startDateString,
    startTimestamp: startDateTimestamp,
    endDate: endDateString,
    baseBrowser,
    browsers: startBrowsers,
    events,
  }));
};
