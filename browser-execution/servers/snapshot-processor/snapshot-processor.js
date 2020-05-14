require('dotenv').config();
const express = require('express');

const { setDate, router } = require('./snapshot-router');
const { writeResults } = require('./snapshot-comparator');

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

  server.on('error', (error) => {
    logger.logError(`Server Error: ${error}`);
    throw error;
  });
};

module.exports.writeResults = writeResults;
