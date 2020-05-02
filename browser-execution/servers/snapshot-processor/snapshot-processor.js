require('dotenv').config();
const express = require('express');

const { setDate, router } = require('./image-upload/router');
const { writeResults } = require('./image-upload/browser-control');

const { snapshotProcessorServerConfig } = require('../../../shared/config.js').getContainerConfig();
const logger = require('../../../shared/logger').newInstance('Snapshot Processor Server');

const port = snapshotProcessorServerConfig && snapshotProcessorServerConfig.port ? snapshotProcessorServerConfig.port : '8081';
const app = express();

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const ans = { error: err.message };
  res.status(400);
  res.json(ans);

  return ans;
};

module.exports.start = (dateString) => {
  // Routes
  setDate(dateString);
  app.use('/', router);
  // Middleware
  app.use(errorHandler);

  // Main action
  const server = app.listen(port, () => {
    logger.logInfo('Snapshot Server started on port...', port);
  });

  server.on('error', (err) => {
    logger.logError(`Server Error: ${err}`);
    throw new Error(`Server Error: ${err.message}`);
  });
};

module.exports.writeResults = writeResults;
