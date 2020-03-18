const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const { registerImage } = require("./browser-control");
const imagePath = process.env.IMAGE_APP_DIR || "/screenshots";

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

const getFileName = imageRequestBody => {
  let dirPath = imagePath + path.sep + imageRequestBody.id;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  return `${imageRequestBody.id}${path.sep}${imageRequestBody.browser}_${imageRequestBody.event}_${imageRequestBody.selector}_${imageRequestBody.id}`; //TODO: Folder based? Name based?
};

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, imagePath);
  },
  filename: function(req, file, cb) {
    console.log("BODY", req.body);
    let imageRequestBody = req.body;
    let fileName = getFileName(imageRequestBody);
    cb(null, `${fileName}-${Date.now()}${getMimetypeExtension(file.mimetype)}`);
  }
});

let upload = multer({ storage: storage });
const router = express.Router();

// Post new image. Expected format:
/*
{
    "image":file,
    "id":int,
    "event":Stringm
    timestamp:Long,
    selector:string,
    browser:Enum
}
*/
router.post("/", upload.single("image"), async function(req, res, next) {
  console.log("ANSWER");
  console.log(req.file);
  console.log(req.body);
  await registerImage(req.body, req.file.filename);
  res.json({ status: "OK" });
});

module.exports = router;
