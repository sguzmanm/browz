const logger = require('../../../shared/logger').newInstance('Snapshot Processor Logs');

const ERR_WRONG_LOG_FORMAT = new Error('error wrong format');

const logs = [];

module.exports.saveLog = (log) => {
  logger.logDebug('Log to save', log);

  if (!log.type || !log.messages || !log.browser || !log.timestamp) {
    throw ERR_WRONG_LOG_FORMAT;
  }

  logs.push(log);
};

module.exports.getLogs = () => logs;
