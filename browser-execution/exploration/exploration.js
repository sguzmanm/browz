// Import handlers (each one returns a promise)

const { cypressHandler } = require('./cypress/cypress');

const handlers = {
  cypress: cypressHandler,
};

module.exports.exploreApp = async () => {
  const handler = handlers.cypress;
  await handler();
};

// Map [string]handler

// Main call handler dpending on paramW, await handler()
