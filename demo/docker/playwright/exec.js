const playwright = require("playwright");
const fs = require("fs");
const util = require("util");

const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);
const port = process.env.HTTP_PORT || "8080";
const URL = process.env.HTTP_URL || `http://localhost:${port}`;

const imgbbUploader = require("imgbb-uploader");

const root = {
  chromium: true
};

const startTests = async config => {
  let browser,
    context = {};
  let browserType = config.browserType;
  console.log("FIRST", browserType);
  try {
    launchConfig = root[browserType]
      ? { dumpio: true, args: ["--no-sandbox"] }
      : { dumpio: true };
    console.log(launchConfig);
    browser = await playwright[browserType].launch(launchConfig);
    context = await browser.newContext();
  } catch (error) {
    console.log("F me", error);
    return;
  }

  try {
    console.log("LOOP", URL);
    const page = await context.newPage();
    page.setViewport(config.viewport);

    await page.goto(URL);
    try {
      await page.fill("input[type=text]", "test", "any");
    } catch (error) {
      console.log("NoTextInput");
    }

    const basePath = `screenshots/${browserType}/${config.viewport.width}x${config.viewport.height}`;
    if (!fs.existsSync(basePath)) {
      await mkdir(basePath, { recursive: true });
    }

    await page.screenshot({
      path: `${basePath}/fill_input.png`
    });
  } catch (error) {
    console.log("[rip]: ", URL, error);
  }

  await browser.close();
};

const uploadImages = async () => {
  const basePath = `screenshots/`;
  try {
    const files = await readdir("./" + basePath);
    for (const name of files) {
      imgbbUploader("1e75677e91c29adddfd31298730553cd", `${basePath}/${name}`)
        .then(response => console.log(response))
        .catch(error => console.error(error));
    }
  } catch (error) {
    console.error("Failed sending image", error);
  }
};

const readImages = async () => {
  const basePath = `screenshots/`;
  try {
    const files = await readdir("./" + basePath);
    for (const name of files) {
      console.log(name);
    }
  } catch (error) {
    console.error("Failed sending image", error);
  }
};

module.exports.exploreApp = async () => {
  try {
    const browserTypes = ["webkit", "chromium", "firefox"];
    const viewports = [
      {
        width: 1280,
        height: 720
      }
    ];

    for (const browserType of browserTypes) {
      for (const viewport of viewports) {
        await startTests({
          browserType: browserType,
          viewport: viewport
        });
      }
    }

    await readImages();

    // await uploadImages();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
