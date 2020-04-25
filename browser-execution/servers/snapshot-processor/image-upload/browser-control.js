const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const compareImages = require('resemblejs/compareImages');

const { browsers } = require('../../../../shared/browsers');
const logger = require('../../../../shared/logger').newInstance('Snapshot Processor Browser Control');

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || path.join(__dirname, '../../../runs');
const baseBrowser = process.env.BASE_BROWSER || 'chrome';
const browserWaitingTime = parseInt(process.env.BROWSER_RESPONSE_WAITING_TIME, 10) || 30000;

// Modify this var to take into account active browsers
const activeBrowsers = [browsers.FIREFOX, browsers.CHROME];

const events = [];
const timeoutMap = {};
const imageMap = {};
const defaultResembleConfig = {
  output: {
    errorColor: {
      red: 255,
      green: 0,
      blue: 255,
    },
    errorType: 'movement',
    transparency: 0.6,
    largeImageThreshold: 0,
    outputDiff: true,
  },
  scaleToSameSize: true,
  ignore: 'antialiasing',
};

let resembleConfig;

const setupResemble = () => {
  resembleConfig = defaultResembleConfig;
  if (!process.env.CONFIG_RESEMBLE) {
    return;
  }

  resembleConfig = JSON.parse(process.env.CONFIG_RESEMBLE);
};

/*
  misMatchPercentage : 100, // %
  isSameDimensions: true, // or false
  getImageDataUrl: function(){}
*/
const compare = async (original, modified, dateString) => {
  if (!resembleConfig) {
    setupResemble();
  }

  const data = await compareImages(
    await readFile(original),
    await readFile(modified),
    resembleConfig,
  );

  const fileSeparation = modified.split(path.sep);

  const idBasePath = `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${fileSeparation[fileSeparation.length - 2]}${path.sep}`;
  const comparisonPath = `${idBasePath}comparison.json`;
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
const compareBrowsers = async (screenshotMap, dateString) => {
  const baseImages = screenshotMap[baseBrowser];
  logger.logDebug('Start Browser comparison...');

  const comparableBrowsers = [...activeBrowsers];
  const spliceIndex = comparableBrowsers.indexOf(baseBrowser);
  comparableBrowsers.splice(spliceIndex, 1);

  try {
    comparableBrowsers.forEach((browser) => {
      logger.logDebug(`Compare ${baseBrowser} vs ${browser}`);
      for (let i = 0; i < baseImages.length; i += 1) {
        compare(
          `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${baseImages[i]}`,
          `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${screenshotMap[browser][i]}`,
          dateString,
        );
      }
    });
  } catch (error) {
    logger.logWarning('Image comparison failed!!! ', error.message, error);
    throw new Error('Image comparison failed!!! ', error.message, error);
  }
};

const checkNewImage = async (key, event, dateString) => {
  if (Object.keys(imageMap[key]).length !== activeBrowsers.length) {
    return;
  }

  await compareBrowsers(imageMap[key], dateString);

  events.push({
    id: key,
    event,
    snapshotPath: `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${key}`,
  });
};

const addNewImage = async (key, browser, event, requestData) => {
  if (!imageMap[key]) {
    return;
  }

  imageMap[key][browser] = requestData.fileNames;
  await checkNewImage(key, event, requestData.dateString);
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
  const results = [];
  for (let i = 0; i < keys.length; i += 1) {
    delete imageMap[keys[i]][browser]; // Remove inactive browser
    results.push(checkNewImage(keys[i], event, requestData.dateString));
  }

  await Promise.all(results);
};

module.exports.registerImage = async (imageRequestBody, requestData) => {
  const { browser, id, event } = imageRequestBody;
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

  await addNewImage(id, browser, event, requestData);
};

module.exports.writeResults = async (startDateString, endDateString) => {
  const runPath = `${imagePath}${path.sep}${startDateString}${path.sep}runs.json`;
  await writeFile(runPath, JSON.stringify({
    seed: process.env.seed,
    start: startDateString,
    end: endDateString,
    events,
  }));
};
