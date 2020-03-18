const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const multer = require("multer");
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

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, imagePath);
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `${file.originalname}-${Date.now()}${getMimetypeExtension(file.mimetype)}`
    );
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

  res.json({ status: "OK" });
});

module.exports.imageRouter = router;
