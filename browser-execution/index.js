const dotenv = require('dotenv');

dotenv.config();

const { startServers } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');

const main = async () => {
  try {
    await startServers();
    await exploreApp();
  } catch (error) {
    console.error('ERROR', error);
  }

  process.exit(1);
};

main();
