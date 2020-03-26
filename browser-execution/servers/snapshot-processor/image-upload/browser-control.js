const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const { browsers } = require("../../../../shared/browsers");
const compareImages = require("resemblejs/compareImages");

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || "/screenshots";
const baseBrowser = process.env.BASE_BROWSER || "electron";
const browserWaitingTime = process.env.BROWSER_RESPONSE_WAITING_TIME || 1000;

// Modify this var to take into account active browsers
let activeBrowsers = [browsers.ELECTRON, browsers.FIREFOX, browsers.CHROME];

let timeoutMap = {};
let imageMap = {};

// Browser comparison of snapshots
const compareBrowsers = async screenshotMap => {
  let baseImages = screenshotMap[baseBrowser];

  let browsers = [...activeBrowsers];
  let spliceIndex = browsers.indexOf(baseBrowser);
  browsers.splice(spliceIndex, 1);

  try {
    for (const browser of browsers) {
      console.log("Compare", baseBrowser, browser);
      for (let i = 0; i < baseImages.length; i++) {
        compare(
          imagePath + path.sep + baseImages[i],
          imagePath + path.sep + screenshotMap[browser][i]
        );
      }
    }
  } catch (error) {
    throw new Error("Image comparison failed", error);
  }
};

const compare = async (original, modified) => {
  // TODO: Configure this by the user
  const options = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255
      },
      errorType: "movement",
      transparency: 0.6,
      largeImageThreshold: 0,
      outputDiff: true
    },
    scaleToSameSize: true,
    ignore: "antialiasing"
  };

  const data = await compareImages(
    await readFile(original),
    await readFile(modified),
    options
  );

  const fileSeparation = modified.split(path.sep);
  const comparisonPath =
    imagePath +
    path.sep +
    baseBrowser +
    "X" +
    fileSeparation[fileSeparation.length - 1];
  await writeFile(comparisonPath, data.getBuffer());
};

const getImageKey = imageRequestBody => {
  return `${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`;
};

const checkNewImage = async key => {
  if (Object.keys(imageMap[key]).length === activeBrowsers.length) {
    await compareBrowsers(imageMap[key]);
    imageMap[key] = {};
  }
};

const addNewImage = async (key, browser, fileNames) => {
  if (!imageMap[key]) {
    return;
  }

  imageMap[key][browser] = fileNames;
  await checkNewImage(key);
};

const deactivateBrowser = async browser => {
  let index = activeBrowsers.indexOf(browser);
  activeBrowsers.splice(index, 1);
  console.log("Deactivating browser...", browser);
  if (browser === baseBrowser) {
    console.error("Base browser deactivated. Nothing more to compare");
    throw new Error("Base browser deactivated. Nothing more to compare");
  }

  //Check images sent by remaining browsers if complete
  for (let key in imageMap) {
    delete imageMap[key][browser]; // Remove inactive browser
    await checkNewImage(key);
  }
};

module.exports.registerImage = async (imageRequestBody, fileNames) => {
  const browser = imageRequestBody.browser;
  if (!activeBrowsers.includes(browser)) {
    console.log(`Inactive browser requested browser ${browser}`);
    throw new Error(`Inactive browser requested browser ${browser}`);
  }

  clearTimeout(timeoutMap[browser]);

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(() => {
    deactivateBrowser(browser);
  }, browserWaitingTime);

  let imageKey = getImageKey(imageRequestBody);
  if (!imageMap[imageKey]) imageMap[imageKey] = {};
  await addNewImage(imageKey, browser, fileNames);
};
