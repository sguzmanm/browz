const Cypress = require("cypress");

const config = {
  baseUrl: "http://www.agustinianosalitre.edu.co/",
  events: 10,
  integrationFolder: "./exploration/cypress",
  chromeWebSecurity: false,
  pluginsFile: false,
  fixturesFolder: false,
  supportFile: false,
  screenshotsFolder: "./exploration/cypress/screenshots",
  testFiles: "*.spec.js",
  video: true,
  trashAssetsBeforeRuns: false
};

const options = {
  /* browser: 'chrome' | 'firefox' | 'electron' */
  headless: true,
  spec: `./exploration/cypress/exploration.spec.js`,
  config,
  configFile: false,
  record: false
};

module.exports.cypressHandler = async () => {
  console.log("Starting cypress...");

  const date = new Date();
  const dateOptopns = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };
  const dateString = date.toLocaleDateString("es-CO", dateOptopns);

  const cypressRuns = [
    Cypress.run({
      browser: "chrome",
      ...options,
      config: {
        videosFolder: `./exploration/cypress/videos/${dateString}/chrome`,
        ...options.config
      }
    }),
    Cypress.run({
      browser: "firefox",
      ...options,
      config: {
        videosFolder: `./exploration/cypress/videos/${dateString}/firefox`,
        ...options.config
      }
    })
  ];

  await Promise.all(cypressRuns);

  console.log("Finished :)");
};
