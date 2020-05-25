const logger = require('../../../shared/logger').newInstance('Snapshot Processor Logs');

const ERR_WRONG_LOG_FORMAT = new Error('wrong error format');

const logs = [];

module.exports.saveLog = (log) => {
  if (!log.type || !log.message || !log.browser || !log.timestamp) {
    throw ERR_WRONG_LOG_FORMAT;
  }

  logger.logDebug('Adding console log', log);
  logs.push(log);
};

module.exports.getLogs = () => logs;
