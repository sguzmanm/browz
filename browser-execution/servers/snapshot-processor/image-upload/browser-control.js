const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const compareImages = require('resemblejs/compareImages');

const { browsers } = require('../../../../shared/browsers');

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || path.join(__dirname, '../../../screenshots');
const baseBrowser = process.env.BASE_BROWSER || 'chrome';
const browserWaitingTime = process.env.BROWSER_RESPONSE_WAITING_TIME || 4000;

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

const compare = async (original, modified) => {
  if (!resembleConfig) {
    setupResemble();
  }

  const data = await compareImages(
    await readFile(original),
    await readFile(modified),
    resembleConfig,
  );

  const fileSeparation = modified.split(path.sep);
  const comparisonPath = `${imagePath + path.sep + baseBrowser}X${fileSeparation[fileSeparation.length - 1]}`;
  await writeFile(comparisonPath, data.getBuffer());
};

// Browser comparison of snapshots
const compareBrowsers = async (screenshotMap) => {
  const baseImages = screenshotMap[baseBrowser];

  const comparableBrowsers = [...activeBrowsers];
  const spliceIndex = comparableBrowsers.indexOf(baseBrowser);
  comparableBrowsers.splice(spliceIndex, 1);

  try {
    comparableBrowsers.forEach((browser) => {
      console.log('Compare', baseBrowser, browser);
      for (let i = 0; i < baseImages.length; i += 1) {
        compare(
          imagePath + path.sep + baseImages[i],
          imagePath + path.sep + screenshotMap[browser][i],
        );
      }
    });
  } catch (error) {
    throw new Error('Image comparison failed', error);
  }
};


const getImageKey = (imageRequestBody) => `${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`;

const checkNewImage = async (key) => {
  if (Object.keys(imageMap[key]).length === activeBrowsers.length) {
    await compareBrowsers(imageMap[key]);
    imageMap[key] = {};
  }
};

const addNewImage = async (key, browser, fileNames) => {
  console.log('[debug]: ', key, fileNames);

  if (!imageMap[key]) {
    return;
  }

  imageMap[key][browser] = fileNames;
  await checkNewImage(key);
};

const deactivateBrowser = async (browser) => {
  const index = activeBrowsers.indexOf(browser);
  activeBrowsers.splice(index, 1);
  console.log('Deactivating browser...', browser);
  if (browser === baseBrowser) {
    console.error('Base browser deactivated. Nothing more to compare');
    throw new Error('Base browser deactivated. Nothing more to compare');
  }

  // Check images sent by remaining browsers if complete
  const keys = Object.keys(imageMap);
  const results = [];
  for (let i = 0; i < keys.length; i += 1) {
    delete imageMap[keys[i]][browser]; // Remove inactive browser
    results.push(checkNewImage(keys[i]));
  }

  await Promise.all(results);
};

module.exports.registerImage = async (imageRequestBody, fileNames) => {
  const { browser } = imageRequestBody;
  if (!activeBrowsers.includes(browser)) {
    console.log(`Inactive browser requested browser ${browser}`);
    throw new Error(`Inactive browser requested browser ${browser}`);
  }

  clearTimeout(timeoutMap[browser]);

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(() => {
    deactivateBrowser(browser);
  }, browserWaitingTime);

  const imageKey = getImageKey(imageRequestBody);
  if (!imageMap[imageKey]) { imageMap[imageKey] = {}; }
  await addNewImage(imageKey, browser, fileNames);
};
