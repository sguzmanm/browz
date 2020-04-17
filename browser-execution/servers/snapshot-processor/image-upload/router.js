require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { registerImage } = require('./browser-control');

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || path.join(__dirname, '../../../runs');
let dateString;

const BEFORE_IMAGE = 'before';
const AFTER_IMAGE = 'after';

const calculateDateString = () => {
  const date = new Date();
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  dateString = date.toLocaleDateString('es-CO', dateOptions).replace(':', '');
};

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
  const dirPath = `${imagePath}${path.sep}${dateString}${path.sep}snapshots${path.sep}${imageRequestBody.id}`;
  console.log(dirPath);

  mkdirRecursive(dirPath);

  console.log('[Filename]', `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${fieldName}`);
  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${fieldName}`;
};

const storage = multer.diskStorage({
  destination(req, file, resolveDestination) {
    if (!dateString) {
      calculateDateString();
    }

    const destination = `${imagePath}${path.sep}${dateString}${path.sep}snapshots`;
    console.log('DESTINATION', destination);
    resolveDestination(null, destination);
  },
  filename(req, file, createFilename) {
    console.log('FILENAME', file.fieldname);
    const fieldName = file.fieldname;
    if (fieldName !== BEFORE_IMAGE && fieldName !== AFTER_IMAGE) {
      console.error('Invalid file passed during request');
      return;
    }

    const imageRequestBody = req.body;
    console.log(imageRequestBody);
    const fileName = getFilename(fieldName, imageRequestBody);
    console.log(fileName);
    createFilename(
      null,
      `${fileName}${getMimetypeExtension(file.mimetype)}`,
    );
    console.log('After create');
  },
});

const upload = multer({ storage });
const router = express.Router();

const getFile = (files, fieldname) => files.find((file) => file.fieldname === fieldname) || {};

// Post new image. Expected format: MULTIPART-FORM/DATA
/*
{
    before:file,
    after: file,
    id:String,
    event:String,
    selector:string,
    browser:String,

}
*/
router.post('/', upload.any(), async (req, res, next) => {
  console.log('POST');
  console.log(getFile(req.files, AFTER_IMAGE).filename);
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
    console.log(err);
    next(err);
  }
});

module.exports = router;
