const dotenv = require('dotenv');

dotenv.config();

// const { startServers } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');

const main = async () => {
  // await startServers();
  await exploreApp();
};

try {
  main();
} catch (error) {
  console.error('ERROR', error);
  process.exit(1);
}
