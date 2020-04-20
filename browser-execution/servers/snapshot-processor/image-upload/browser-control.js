const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const compareImages = require('resemblejs/compareImages');

const { browsers } = require('../../../../shared/browsers');
const logger = require('../../../../shared/logger');

logger.newInstance('Snapshot Processor Browser Control');

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || path.join(__dirname, '../../../runs');
const baseBrowser = process.env.BASE_BROWSER || 'chrome';
const browserWaitingTime = parseInt(process.env.BROWSER_RESPONSE_WAITING_TIME, 10) || 30000;


// Modify this var to take into account active browsers
const activeBrowsers = [browsers.FIREFOX, browsers.CHROME];

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
};

// Browser comparison of snapshots
const compareBrowsers = async (screenshotMap, dateString) => {
  logger.logInfo('Start Browser comparison');
  const baseImages = screenshotMap[baseBrowser];

  const comparableBrowsers = [...activeBrowsers];
  const spliceIndex = comparableBrowsers.indexOf(baseBrowser);
  comparableBrowsers.splice(spliceIndex, 1);

  logger.logInfo(baseImages, screenshotMap);
  try {
    comparableBrowsers.forEach((browser) => {
      logger.logInfo(`Compare ${baseBrowser} vs ${browser}`);
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

const checkNewImage = async (key, dateString) => {
  if (Object.keys(imageMap[key]).length === activeBrowsers.length) {
    await compareBrowsers(imageMap[key], dateString);
    imageMap[key] = {};
  }
};

const addNewImage = async (key, browser, requestData) => {
  if (!imageMap[key]) {
    return;
  }

  imageMap[key][browser] = requestData.fileNames;
  await checkNewImage(key, requestData.dateString);
};

const deactivateBrowser = async (browser, requestData) => {
  const index = activeBrowsers.indexOf(browser);
  activeBrowsers.splice(index, 1);
  logger.logInfo('Deactivating browser...', browser);
  if (browser === baseBrowser) {
    logger.logError('Base browser deactivated. Nothing more to compare');
    throw new Error('Base browser deactivated. Nothing more to compare');
  }

  // Check images sent by remaining browsers if complete
  const keys = Object.keys(imageMap);
  const results = [];
  for (let i = 0; i < keys.length; i += 1) {
    delete imageMap[keys[i]][browser]; // Remove inactive browser
    results.push(checkNewImage(keys[i], requestData.dateString));
  }

  await Promise.all(results);
};

module.exports.registerImage = async (imageRequestBody, requestData) => {
  const { browser } = imageRequestBody;
  if (!activeBrowsers.includes(browser)) {
    logger.logWarning(`Inactive browser requested browser ${browser}`);
    throw new Error(`Inactive browser requested browser ${browser}`);
  }

  clearTimeout(timeoutMap[browser]);

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(() => {
    deactivateBrowser(browser, requestData);
  }, browserWaitingTime);

  const imageKey = imageRequestBody.id;
  if (!imageMap[imageKey]) {
    imageMap[imageKey] = {};
  }

  await addNewImage(imageKey, browser, requestData);
};
