const HttpServer = require('./http/http-server');
const ImageServer = require('./snapshot-processor/snapshot-processor');

module.exports.startServers = (dateString) => {
  Promise.all([
    HttpServer.start(),
    ImageServer.start(dateString),
  ]);
};

module.exports.writeResults = ImageServer.writeResults;
