const { browsers } = require("../../../shared/browsers");

let responseMap = {};
responseMap[browsers.CHROMIUM] = true;
responseMap[browsers.FIREFOX] = true;
responseMap[browsers.WEBKIT] = true;

let timeoutMap = {};
let imageMap = {};

const registerImage = async (imageRequestBody, fileName) => {
  const browser = imageRequestBody.browser;
  if (!responseMap[browser]) {
    return { status: "Kill browser" };
  }

  // Set waiting timeout for image from browser
  timeoutMap[browser] = setTimeout(() => {
    responseMap[browser] = undefined;
  }, process.env.BROWSER_RESPONSE_WAITING_TIME);

  let key = `${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`;
  if (!imageMap[key]) imageMap[key] = {};
  imageMap[key][browser] = fileName;

  if (imageMap[key].length === responseMap.length) {
    compareBrowsers(imageMap[key]);
  }
};

const compareBrowsers = screenshotMap => {};
