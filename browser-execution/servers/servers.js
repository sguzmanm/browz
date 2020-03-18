const HttpServer = require("./http/http-server");
const ImageServer = require("./snapshot-processor/snapshot-processor");

module.exports.getServerExecs = dir => {
  return [HttpServer.start(dir), ImageServer.start(dir)];
};
