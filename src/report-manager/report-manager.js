const fs = require('fs');
const path = require('path');

const visualizerPath = path.join(__dirname, './visualizer/dist');
const logger = require('../../shared/logger').newInstance('Report Manager');

const moveReportSnapshots = async (imagesDestination, runsPath) => {
  const files = await fs.promises.readdir(imagesDestination);
  const movedFiles = [];

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      // Get the full paths
      const imagePath = path.join(imagesDestination, file);
      const destinationPath = path.join(runsPath, file);
      if (fs.existsSync(destinationPath)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await fs.promises.rename(imagePath, destinationPath);

      // Log because we're crazy
      logger.logDebug(`Moved ${imagePath} -> ${destinationPath}`);

      movedFiles.push(file);
    }
  } catch (error) {
    logger.logWarning(`Could not move file: ${error}`);
  }
};


module.exports.createReportData = async (imagesDestination) => {
  try {
    const runsPath = `${visualizerPath}/runs`;
    if (!fs.existsSync(runsPath)) {
      fs.mkdirSync(runsPath);
    }

    const resultFiles = await moveReportSnapshots(imagesDestination, runsPath);

    let runs = [];
    if (fs.existsSync(`${runsPath}/runs.json`)) {
      runs = await fs.promises.readFile(`${runsPath}/runs.json`);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const file of resultFiles) {
      if (runs.includes(file)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      runs.push(file);
    }

    await fs.promises.writeFile(`${runsPath}/runs.json`);
  } catch (e) {
    // Catch anything bad that happens
    logger.logError(`Error moving report files: ${e}`);
  }
};
