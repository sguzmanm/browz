const fs = require('fs');
const fse = require('fs-extra'); // TODO: Do implementation of recursive copy to avoid this dependency
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const visualizerPath = path.join(__dirname, './visualizer/dist');
const logger = require('../../shared/logger').newInstance('Report Manager');

const moveReportSnapshots = async (imagesDestination, runsPath) => {
  const files = await readdir(imagesDestination);
  const movedFiles = [];

  try {
    await Promise.all(files.map(async (file) => {
      // Get the full paths
      const imagePath = path.join(imagesDestination, file);
      const destinationPath = path.join(runsPath, file);

      if (fs.existsSync(destinationPath)) {
        return;
      }

      await fse.copy(imagePath, destinationPath);

      logger.logDebug(`Moved ${imagePath} -> ${destinationPath}`);

      movedFiles.push(file);
    }));
  } catch (error) {
    logger.logWarning(`Could not move file: ${error}`);
  }

  return movedFiles;
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
      const runContent = await await readFile(`${runsPath}/runs.json`);
      runs = JSON.parse(runContent);
    }

    resultFiles.forEach((file) => {
      if (!runs.includes(file)) { runs.push(file); }
    });

    await writeFile(`${runsPath}/runs.json`, JSON.stringify(runs));
  } catch (e) {
    logger.logError(`Error moving report files: ${e}`);
  }
};
