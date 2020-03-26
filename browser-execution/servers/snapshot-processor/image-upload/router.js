const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const { registerImage } = require("./browser-control");
const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || "/screenshots";

const BACK_IMAGE = "before";
const AFTER_IMAGE = "after";

const getMimetypeExtension = mimetype => {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/tff":
      return ".tff";
    default:
      return "";
  }
};

const getFilename = (fieldName, imageRequestBody) => {
  let dirPath = imagePath + path.sep + imageRequestBody.id;

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${fieldName}_${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`; //FIXME: Folder based? Name based?
};

let storage = multer.diskStorage({
  destination: function(req, file, resolveDestination) {
    resolveDestination(null, imagePath);
  },
  filename: function(req, file, createFilename) {
    let fieldName = file.fieldname;
    if (fieldName !== BACK_IMAGE && fieldName !== AFTER_IMAGE) {
      console.error("Invalid file passed during request");
      return;
    }

    let imageRequestBody = req.body;
    let fileName = getFilename(fieldName, imageRequestBody);
    createFilename(
      null,
      `${fileName}-${Date.now()}${getMimetypeExtension(file.mimetype)}`
    );
  }
});

let upload = multer({ storage: storage });
const router = express.Router();

const findFileByFieldname = (files, fieldname) => {
  return files.find(file => file.fieldname === fieldname) || {};
};

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
router.post("/", upload.any(), async function(req, res, next) {
  try {
    await registerImage(req.body, [
      findFileByFieldname(req.files, BACK_IMAGE).filename,
      findFileByFieldname(req.files, AFTER_IMAGE).filename
    ]);
    res.json({ status: "OK" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
