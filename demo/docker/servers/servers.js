const HttpServer = require("./http/http-server");
const ImageServer = require("./images/image-server");

module.exports.getServerExecs = dir => {
  console.log("DIR");
  return [
    HttpServer.start(dir, () => {
      process.exit(1);
    }),
    ImageServer.start(dir, () => {
      process.exit(1);
    })
  ];
};
