
/* eslint-disable */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

let currentBrowser = "Default";
const Client = require('../snapshot-client/snapshot-client');
const LOG_FILENAME = "./monkey-log.html"
var fs = require('fs');

const { setLevel, newInstance } = require('../../../shared/logger');

setLevel(process.env.LEVEL); // Set level since cypress plugin is called in a different context from the main execution
const logger = newInstance('Cypress Plugins');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('task', {
    logCommand({ funtype, info }) {
      let html = `<li><span><h2> ${funtype} event</h2>`
      if (!!info) html += `<p><strong>Details: </strong> ${info}</p>`
      html += "</span></li>"
      fs.appendFile(LOG_FILENAME, html, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Logged #${funtype}`)
      })
      return null
    },
    logStart({ type, url, seed, browser }) {
      currentBrowser = browser;
      //Date might be inaccurate
      var currentdate = new Date(Date.now());
      var date = currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear();
      var time = currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
      fs.appendFile(LOG_FILENAME, `<html><body><h1>Execution of ${type} in <a href = ${url}>${url}</a></h1><h2>Date of execution: ${date} at ${time}</h2><h2>Seed:${seed}</h2><ol type = '1'>`, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Log started`)
      })
      return null
    },
    logEnd() {
      fs.appendFile(LOG_FILENAME, "</ol></body></html>", (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Finished logging`)
      })
      return null
    },
    logPctNo100() {
      fs.appendFile(LOG_FILENAME, `<h1>Error:</h1><p>El porcentaje de eventos configurados no suma 100, sino ${pcg}</p>`, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Logged error`)
      })
      return null
    },
    genericLog({ message }) {
      logger.logDebug(`${currentBrowser}: ${message}`)
      return null
    },
    genericReport({ html }) {
      fs.appendFile(LOG_FILENAME, html, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Logged error`)
      })
      return null
    }
  });

  require('cypress-log-to-output').install(on, (type, event) => {
    logger.logDebug(`Cypress event ${type}`)

    if (type === 'browser') {
      fs.appendFile(LOG_FILENAME, `<p><strong>Browser event (source: ${event.source}): </strong>${event.text}</p>`, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Finished logging`)
      })
    }
    else if (type === 'console') {
      fs.appendFile(LOG_FILENAME, `<p><strong>Console ${event.type} event. Trace: </strong>${(!!event.stackTrace) ? event.stackTrace.description : "none"}</p>`, (err) => {
        if (err) throw err
        logger.logDebug(`${currentBrowser}: Finished logging`)
      })

      // Send logs to snapshot client
      let logArgs = [];
      if (event.args) {
        logArgs = event.args.map(arg => {
          if (arg.type === "string") {
            return arg.value
          }

          return JSON.stringify(arg.value)
        })
      }

      Client.sendConsoleLog({
        type: event.type,
        timestamp: event.timestamp,
        browser: currentBrowser,
        message: logArgs
      })
    }

    return true;
  });

  // snapshot plugins

  let preSnapshot = null
  let snapshotError = null

  on('after:screenshot', (snapshot) => {
    if (snapshotError) {
      throw snapshotError
    }

    if (!preSnapshot) {
      preSnapshot = snapshot
      return
    }

    Client.sendSnapshot([preSnapshot, snapshot])
      .catch(err => snapshotError = err);
    preSnapshot = null
  })
}
