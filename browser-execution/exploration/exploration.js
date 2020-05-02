const logger = require('../../shared/logger').newInstance('Browser Exploration');

// Import handlers (each one returns a promise)
const { cypressHandler } = require('./cypress/cypress');

const handlers = {
  cypress: cypressHandler,
};

module.exports.exploreApp = async () => {
  const handler = handlers.cypress;

  try {
    await handler();
  } catch (error) {
    logger.logError(error);
    throw error;
  }
};

// Map [string]handler

// Main call handler dpending on paramW, await handler()
