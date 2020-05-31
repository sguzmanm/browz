const logger = require('../../../shared/logger').newInstance('Snapshot Processor Logs');

const ERR_WRONG_LOG_FORMAT = new Error('wrong error format');

const logs = [];

module.exports.saveLog = (log) => {
  logger.logDebug('Log to save', log);
  if (log.type !== 'error' && log.type !== 'warning') { return; }

  if (!log.type || !log.message || !log.browser || !log.timestamp) {
    throw ERR_WRONG_LOG_FORMAT;
  }

  logger.logDebug('Adding console log', log);
  logs.push(log);
};

module.exports.getLogs = () => logs;
