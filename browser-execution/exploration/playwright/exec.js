const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const util = require('util');

const config = require('../../../shared/config.js').getContainerConfig();

const port = config.httpServer ? config.httpServer.port : '8080';
const URL = `http://localhost:${port}`;

const mkdir = util.promisify(fs.mkdir);

const logger = require('../../../shared/logger').newInstance('Playwright');

const root = {
  chromium: true,
};

const startTests = async (config) => {
  let browser;
  let context = {};
  const { browserType } = config;
  logger.log('FIRST', browserType);
  try {
    const launchConfig = root[browserType] ? { args: ['--no-sandbox'] } : {};
    logger.log(launchConfig);
    browser = await playwright[browserType].launch(launchConfig);
    context = await browser.newContext();
  } catch (error) {
    logger.log('F me', error);
    return;
  }

  try {
    logger.log('LOOP', URL);
    const page = await context.newPage();
    page.setViewport(config.viewport);

    await page.goto(URL);
    try {
      await page.fill('input[type=text]', 'test', 'any');
    } catch (error) {
      logger.log('NoTextInput');
    }

    const basePath = `screenshots/${browserType}`;
    if (!fs.existsSync(basePath)) {
      await mkdir(basePath, { recursive: true });
    }

    await page.screenshot({
      path: `${basePath}/fill_input_${config.viewport.width}x${config.viewport.height}.png`,
    });
  } catch (error) {
    logger.log('[rip]: ', URL, error);
  }

  await browser.close();
};

module.exports.exploreApp = async () => {
  try {
    const browserTypes = ['webkit', 'chromium', 'firefox'];
    const viewports = [
      {
        width: 1280,
        height: 720,
      },
      {
        width: 300,
        height: 400,
      },
      {
        width: 1500,
        height: 800,
      },
    ];

    for (const browserType of browserTypes) {
      for (const viewport of viewports) {
        await startTests({
          browserType,
          viewport,
        });
      }
    }

    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
