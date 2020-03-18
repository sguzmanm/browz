const playwright = require("playwright");
const fs = require("fs");
const util = require("util");

const mkdir = util.promisify(fs.mkdir);
const port = process.env.HTTP_PORT || "8080";
const URL = `http://localhost:${port}`;

const root = {
  chromium: true
};

const startTests = async config => {
  let browser,
    context = {};
  let browserType = config.browserType;
  console.log("FIRST", browserType);
  try {
    let launchConfig = root[browserType] ? { args: ["--no-sandbox"] } : {};
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

    const basePath = `screenshots/${browserType}`;
    if (!fs.existsSync(basePath)) {
      await mkdir(basePath, { recursive: true });
    }

    await page.screenshot({
      path: `${basePath}/fill_input_${config.viewport.width}x${config.viewport.height}.png`
    });
  } catch (error) {
    console.log("[rip]: ", URL, error);
  }

  await browser.close();
};

module.exports.exploreApp = async () => {
  try {
    const browserTypes = ["webkit", "chromium", "firefox"];
    const viewports = [
      {
        width: 1280,
        height: 720
      },
      {
        width: 300,
        height: 400
      },
      {
        width: 1500,
        height: 800
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

    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
