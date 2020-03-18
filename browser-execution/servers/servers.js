const HttpServer = require("./http/http-server");
const ImageServer = require("./snapshot-processor/snapshot-processor");

module.exports.getServerExecs = () => {
  return [HttpServer.start(), ImageServer.start()];
};
