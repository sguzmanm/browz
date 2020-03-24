const Cypress = require("cypress");
const path = require("path");

const config = {
  integrationFolder: ".${path.sep}exploration${path.sep}cypress",
  pluginsFile: false,
  fixturesFolder: false,
  supportFile: false,
  screenshotsFolder:
    ".${path.sep}exploration${path.sep}cypress${path.sep}screenshots",
  testFiles: "*.spec.js",
  video: true,
  trashAssetsBeforeRuns: false
};

const options = {
  /* browser: 'chrome' | 'firefox' | 'electron' */
  headless: true,
  spec: `.${path.sep}exploration${path.sep}cypress${path.sep}exploration.spec.js`,
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
        videosFolder: `.${path.sep}exploration${path.sep}cypress${path.sep}videos${path.sep}${dateString}${path.sep}chrome`,
        ...options.config
      }
    }),
    Cypress.run({
      browser: "firefox",
      ...options,
      config: {
        videosFolder: `.${path.sep}exploration${path.sep}cypress${path.sep}videos${path.sep}${dateString}${path.sep}firefox`,
        ...options.config
      }
    })
  ];

  await Promise.all(cypressRuns);

  console.log("Finished :)");
};
