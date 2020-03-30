const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const { registerImage } = require('./browser-control');

const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || '/screenshots';

const BACK_IMAGE = 'before';
const AFTER_IMAGE = 'after';

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
  const dirPath = imagePath + path.sep + imageRequestBody.id;

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${fieldName}_${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`; // FIXME: Folder based? Name based?
};

const storage = multer.diskStorage({
  destination(req, file, resolveDestination) {
    resolveDestination(null, imagePath);
  },
  filename(req, file, createFilename) {
    const fieldName = file.fieldname;
    if (fieldName !== BACK_IMAGE && fieldName !== AFTER_IMAGE) {
      console.error('Invalid file passed during request');
      return;
    }

    const imageRequestBody = req.body;
    const fileName = getFilename(fieldName, imageRequestBody);
    createFilename(
      null,
      `${fileName}-${Date.now()}${getMimetypeExtension(file.mimetype)}`,
    );
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
  try {
    await registerImage(req.body, [
      getFile(req.files, BACK_IMAGE).filename,
      getFile(req.files, AFTER_IMAGE).filename,
    ]);
    res.json({ status: 'OK' });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
