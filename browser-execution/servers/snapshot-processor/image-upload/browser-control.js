const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const { browsers } = require("../../../shared/browsers");
const compareImages = require("resemblejs/compareImages");

const imagePath = process.env.IMAGE_APP_DIR || "/screenshots";
const baseBrowser = process.env.BASE_BROWSER || "chromium";
const browserWaitingTime = process.env.BROWSER_RESPONSE_WAITING_TIME || 1000;

let responseMap = {};
responseMap[browsers.CHROMIUM] = true;
responseMap[browsers.FIREFOX] = true;
responseMap[browsers.WEBKIT] = true;

let timeoutMap = {};
let imageMap = {};

const getImageKey = imageRequestBody => {
  return `${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`;
};

const checkNewImage = async (imageRequestBody, browser, fileName) => {
  let key = getImageKey(imageRequestBody);
  if (!imageMap[key]) imageMap[key] = {};
  imageMap[key][browser] = fileName;

  if (imageMap[key].length === responseMap.length) {
    await compareBrowsers(imageMap[key]);
  }
};

module.exports.registerImage = async (imageRequestBody, fileName) => {
  const browser = imageRequestBody.browser;
  if (!responseMap[browser]) {
    console.log("Requesting inactive browser", browser);
    return false;
  }

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(async () => {
    responseMap[browser] = undefined;
    console.log("Desactivating browser", browser);
    await checkNewImage(imageRequestBody, browser, fileName);
  }, browserWaitingTime);

  await checkNewImage(imageRequestBody, browser, fileName);
};

const compareBrowsers = async screenshotMap => {
  let baseImage = screenshotMap[baseBrowser];

  let browsers = Object.keys(screenshotMap);
  let spliceIndex = browsers.indexOf(baseBrowser);
  browsers.splice(spliceIndex, 1);
  console.log(spliceIndex, browsers);

  try {
    for (const browser of browsers) {
      compare(
        imagePath + path.sep + baseImage,
        imagePath + path.sep + screenshotMap[browser]
      );
    }
  } catch (error) {
    throw new Error("Resemble failed", error);
  }
};

const compare = async (original, modified) => {
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

  // The parameters can be Node Buffers
  // data is the same as usual with an additional getBuffer() function
  const data = await compareImages(
    await readFile(original),
    await readFile(modified),
    options
  );

  console.log("DATA", data);

  console.log(modified);
  const fileSeparation = modified.split(path.sep);
  const comparisonPath =
    imagePath +
    path.sep +
    baseBrowser +
    "X" +
    fileSeparation[fileSeparation.length - 1];
  console.log(comparisonPath);
  await writeFile(comparisonPath, data.getBuffer());
};
