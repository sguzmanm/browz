const dotenv = require('dotenv');

dotenv.config();

const { startServers } = require('./servers/servers');
const { exploreApp } = require('./exploration/exploration');

const main = async () => {
  try {
    console.log('------------Start Servers -------------');
    await startServers();
    console.log('------------Explore App -------------');
    await exploreApp();
  } catch (error) {
    console.error('ERROR', error);
  }

  process.exit(0);
};

main();
