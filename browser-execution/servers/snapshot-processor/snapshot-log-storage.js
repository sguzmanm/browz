const logger = require('../../../shared/logger').newInstance('Snapshot Processor Comparator');

const ERR_WRONG_LOG_FORMAT = new Error('wrong error format');

const logs = [];

module.exports.saveLog = (log) => {
  if (!log.type || !log.message || !log.browser) {
    throw ERR_WRONG_LOG_FORMAT;
  }

  logger.logDebug('Adding console log', log);
  logs.push(log);
};

module.exports.logs = logs;
