// Communication used in frameworks of automated testing
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

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
    form.append('before', beforeImage);
    form.append('after', afterImage);

    form.append('browser', browser);
    form.append('id', id);
    form.append('event', `${eventType}: ${event}`);

    const options = {
      method: 'POST',
      headers: form.getHeaders(),
      body: form.getBuffer(),
    };

    const response = await fetch('https://localhost:8081', options);
    const text = await response.text();

    console.log(`Response: (${response.status}) content:\n${text}\n------------`);
  } catch (error) {
    console.error('Error reading images: ', error);
  }
};
