const HttpServer = require('./http/http-server');
const ImageServer = require('./snapshot-processor/snapshot-processor');

module.exports.startServers = () => {
  Promise.all([
    HttpServer.start(),
    ImageServer.start(),
  ]);
};

module.exports.writeResults = () => {
  Promise.all([
    ImageServer.writeResults(),
  ]);
};
