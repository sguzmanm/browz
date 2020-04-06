const dotenv = require('dotenv');

dotenv.config();

const express = require('express');

const app = express();
const ImageRouter = require('./image-upload/router');

const port = process.env.IMAGE_PORT || '8081';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const ans = { error: err.message };
  res.status(400);
  res.json(ans);
  return ans;
};

module.exports.start = () => {
  // Routes
  app.use('/', ImageRouter);
  // Middleware
  app.use(errorHandler);

  // Main action
  const server = app.listen(port, () => {
    console.log('Snapshot Server started', port);
  });
  server.on('error', (err) => {
    console.error('Snapshot Processor Error:', err);
    throw new Error('Snapshot Processor Error:', err.message);
  });
};
