require('dotenv').config(); // Setup variables from .env file
const express = require('express');
const { setDate, router } = require('./image-upload/router');
const { writeResults } = require('./image-upload/browser-control');

const port = process.env.IMAGE_PORT || '8081';
const app = express();
const logger = require('../../../shared/logger').newInstance('Snapshot Processor Server');

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
    logger.logInfo('Snapshot Server started', port);
  });

  server.on('error', (err) => {
    logger.logError('Snapshot Processor Error:', err);
    throw new Error('Snapshot Processor Error:', err.message);
  });
};

module.exports.writeResults = writeResults;
