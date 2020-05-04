require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const { registerImage } = require('./snapshot-comparator');
const logger = require('../../../shared/logger').newInstance('Snapshot Processor Router');
const { container } = require('../../../shared/config.js').getContainerConfig();

const snapshotDestinationDir = container && container.snapshotDestinationDir ? container.snapshotDestinationDir : '/tmp/runs';

const BEFORE_IMAGE = 'before';
const AFTER_IMAGE = 'after';

let dateString = 'Regular run';

module.exports.setDate = (date) => {
  dateString = date;
};

const router = express.Router();

const mkdirRecursive = (fullPath) => {
  let currentArg = 0;
  const pathArgs = fullPath.split(path.sep);
  let currentPath = pathArgs[currentArg];

  while (currentArg !== pathArgs.length) {
    if (currentPath.trim() !== '' && !fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    currentPath += path.sep + pathArgs[currentArg += 1];
  }
};

const getMimetypeExtension = (mimetype) => {
  switch (mimetype) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/tff':
      return '.tff';
    default:
      return '';
  }
};

const getFilename = (fieldName, imageRequestBody) => {
  const dirPath = `${snapshotDestinationDir}${path.sep}${dateString}${path.sep}snapshots${path.sep}${imageRequestBody.id}`;
  mkdirRecursive(dirPath);

  logger.logDebug(`Saving file ${imageRequestBody.browser}_${fieldName} for id ${imageRequestBody.id}`);
  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${fieldName}`;
};

const storage = multer.diskStorage({
  destination(req, file, resolveDestination) {
    const destination = `${snapshotDestinationDir}${path.sep}${dateString}${path.sep}snapshots`;
    resolveDestination(null, destination);
  },
  filename(req, file, createFilename) {
    const fieldName = file.fieldname;
    if (fieldName !== BEFORE_IMAGE && fieldName !== AFTER_IMAGE) {
      logger.logError(`Invalid file passed during request ${fieldName}`);
      throw new Error(`Invalid file passed during request ${fieldName}`);
    }

    const imageRequestBody = req.body;
    const fileName = getFilename(fieldName, imageRequestBody);
    createFilename(
      null,
      `${fileName}${getMimetypeExtension(file.mimetype)}`,
    );
  },
});

const upload = multer({ storage });

const getFile = (files, fieldname) => files.find((file) => file.fieldname === fieldname) || {};

// Post new image. Expected format: MULTIPART-FORM/DATA
/*
{
    before:file,
    after: file,
    id:String,
    eventName:String,
    eventType:string,
    browser:String,
}
*/
router.post('/', upload.any(), async (req, res, next) => {
  try {
    await registerImage(req.body, {
      dateString,
      fileNames: [
        getFile(req.files, BEFORE_IMAGE).filename,
        getFile(req.files, AFTER_IMAGE).filename,
      ],
    });
    res.json({ status: 'OK' });
  } catch (err) {
    logger.logError(`${err}`);
    next(err);
  }
});

module.exports.router = router;
