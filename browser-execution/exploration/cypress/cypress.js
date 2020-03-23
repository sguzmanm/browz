// TBD Make it fking work
const Cypress = require('cypress');

module.exports.cypressHandler = async () => {
  console.log('Starting cypress...');

  await Cypress.run({
    browser: 'firefox',
    headless: true,
    spec: './exploration/cypress/exploration.spec.js',
    config: {
      integrationFolder: './exploration/cypress',
      pluginsFile: false,
      fixturesFolder: false,
      supportFile: false,
      videosFolder: './exploration/cypress/videos',
      screenshotsFolder: './exploration/cypress/screenshots',
      testFiles: '*.spec.js',
      video: true,
    },
    configFile: false,
    record: false,
  });

  console.log('Finished :)');
};
