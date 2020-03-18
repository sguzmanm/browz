const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const ImageRouter = require("./image-upload/router");

const port = process.env.IMAGE_PORT || "8081";

const setupServer = (resolve, errorHandler) => {
  // Middleware
  app.use(errorHandler);

  //Routes
  app.use("/", ImageRouter);

  app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
    resolve(port);
  });
};

module.exports.start = () => {
  return new Promise((resolve, reject) => {
    const errorHandler = (err, req, res, next) => {
      if (res.headersSent) {
        return next(err);
      }
      res.status(500);
      res.render("error", { error: err });
      reject(err);
    };

    setupServer(resolve, errorHandler);
  });
};
