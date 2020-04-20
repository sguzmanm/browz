// Communication used in frameworks of automated testing
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../../../shared/logger').newInstance('Snapshot Client');

const ERR_SERVER_STOPPED_PROCESSING_REQUESTS = new Error('Snapshot Server won\'t process more requests');

const getBrowser = (path) => {
  // TODO improve
  if (path.includes('chrome')) return 'chrome';
  return 'firefox';
};

module.exports.sendSnapshot = async ([beforeSnapshot, afterSnapshot]) => {
  const { path: beforePath } = beforeSnapshot;
  const { path: afterPath } = afterSnapshot;

  const [id, eventType, event] = beforePath.split('/')[beforePath.split('/').length - 1].split('.')[0].split('-');
  const browser = getBrowser(beforePath);

  let beforeImage;
  let afterImage;

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
    if (response.status === 400) {
      logger.logWarning(ERR_SERVER_STOPPED_PROCESSING_REQUESTS);
      throw ERR_SERVER_STOPPED_PROCESSING_REQUESTS;
    }

    if (response.status !== 200) {
      logger.logWarning(`Snapshot server returned unknown status: ${response.status}`);
    }
  } catch (error) {
    if (error === ERR_SERVER_STOPPED_PROCESSING_REQUESTS) {
      throw ERR_SERVER_STOPPED_PROCESSING_REQUESTS;
    }

    logger.logError('Error sending images to snapshot server: ', error);
  }
};
