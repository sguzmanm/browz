const fs = require('fs');
const http = require('http');
const nStatic = require('node-static');

const port = process.env.HTTP_PORT || '8080';
const httpPath = process.env.HTTP_APP_DIR || '../../app';
const logger = require('../../../shared/logger').newInstance('HTTP Server');

module.exports.start = () => {
  if (!fs.existsSync(`${httpPath}/index.html`)) {
    logger.logError('No index.html file found');
    throw new Error('No index.html file found');
  }

  const fileServer = new nStatic.Server(httpPath);
  const server = http.createServer((req, res) => {
    logger.logDebug(`Requested ${req.url} with method ${req.method}`);
    fileServer.serve(req, res);
  });

  server.on('error', (error) => {
    logger.logError('Http Server Error:', error);
    throw new Error('Http Server Error:', error.message);
  });

  server.listen(port, () => {
    logger.logInfo('Starting http server on port...', port);
  });
};
