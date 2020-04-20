// Communication used in frameworks of automated testing
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../../../shared/logger').newInstance('Snapshot Client');

const getBrowser = (path) => {
  // TODO improve
  if (path.includes('chrome')) return 'chrome';
  return 'firefox';
};

module.exports.sendSnapshot = async ([beforeSnapshot, afterSnapshot]) => {
  const { path: beforePath } = beforeSnapshot;
  const { path: afterPath } = afterSnapshot;

  logger.logInfo('[client] Before splits');

  const [id, eventType, event] = beforePath.split('/')[beforePath.split('/').length - 1].split('.')[0].split('-');
  const browser = getBrowser(beforePath);

  let beforeImage;
  let afterImage;

  logger.logInfo('[client] After splits');

  try {
    beforeImage = fs.readFileSync(beforePath);
    afterImage = fs.readFileSync(afterPath);

    const form = new FormData();
    form.append('browser', browser);
    form.append('id', id);
    form.append('event', `${eventType}: ${event}`);

    form.append('before', beforeImage, { contentType: 'image/png', filename: 'before.png' });
    form.append('after', afterImage, { contentType: 'image/png', filename: 'after.png' });

    const options = {
      method: 'POST',
      headers: form.getHeaders(),
      body: form.getBuffer(),
    };

    const response = await fetch('http://localhost:8081/', options);
    const text = await response.text();

    logger.logInfo('[client] After fetch');

    logger.logInfo(`Response: (${response.status}) content:\n${text}\n------------`);
  } catch (error) {
    logger.logError('Error reading images: ', error);
  }
};
