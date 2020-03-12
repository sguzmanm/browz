const util = require("util");
const fs = require("fs");
const path = require("path");

const imgbbUploader = require("imgbb-uploader");
const compareImages = require("resemblejs/compareImages");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
let browsers = [];

const BASE_BROWSER = process.env.BASE_BROWSER || "chromium";

module.exports.readImages = async () => {
  let images = [];
  let file;
  let basePath = "screenshots/" + BASE_BROWSER;
  try {
    const files = await readdir(basePath);
    for (const name of files) {
      file = path.resolve(basePath, name);
      images.push(file);
    }
  } catch (error) {
    console.error("Failed sending image", error);
  }

  return images;
};

module.exports.compareBrowsers = async images => {
  console.log(images);
  browsers = ["webkit", "chromium", "firefox"];
  let spliceIndex = browsers.indexOf(BASE_BROWSER);
  browsers.splice(spliceIndex, 1);
  console.log(spliceIndex, browsers);

  try {
    for (const image of images) {
      for (const browser of browsers) {
        compare(image, image.replace(BASE_BROWSER, browser));
      }
    }
  } catch (error) {
    console.error("Resemble failed", error);
  }
};

const compare = async (original, modified) => {
  console.log(original, modified);
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

  const fileSeparation = modified.split(path.sep);
  const comparisonPath =
    BASE_BROWSER +
    "X" +
    fileSeparation[fileSeparation.length - 2] +
    "_" +
    fileSeparation[fileSeparation.length - 1];
  await writeFile(comparisonPath, data.getBuffer());

  await imgbbUploader(process.env.IMGBBKEY, comparisonPath);
};
