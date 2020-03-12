const HttpServer = require("./http/http-server");
const ImageServer = require("./snapshot-processor/snapshot-processor");

module.exports.getServerExecs = dir => {
  return [
    HttpServer.start(dir, () => {
      process.exit(1);
    }),
    ImageServer.start(dir, () => {
      process.exit(1);
    })
  ];
};
