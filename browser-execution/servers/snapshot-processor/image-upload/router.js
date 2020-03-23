const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const { registerImage } = require("./browser-control");
const imagePath = process.env.SNAPSHOT_DESTINATION_DIR || "/screenshots";

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

const getFilename = imageRequestBody => {
  let dirPath = imagePath + path.sep + imageRequestBody.id;
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`; //FIXME: Folder based? Name based?
};

let storage = multer.diskStorage({
  destination: function(req, file, resolveDestination) {
    resolveDestination(null, imagePath);
  },
  filename: function(req, file, createFilename) {
    console.log("BODY", req.body);
    let imageRequestBody = req.body;
    let fileName = getFilename(imageRequestBody);
    createFilename(
      null,
      `${fileName}-${Date.now()}${getMimetypeExtension(file.mimetype)}`
    );
  }
});

let upload = multer({ storage: storage });
const router = express.Router();

// Post new image. Expected format:
/*
{
    image:file,
    id:String,
    event:String,
    selector:string,
    browser:Enum
}
*/
router.post("/", upload.single("image"), async function(req, res, next) {
  try {
    await registerImage(req.body, req.file.filename);
    res.json({ status: "OK" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
