const dotenv = require("dotenv");
dotenv.config();

const { startServers } = require("./servers/servers");

const main = async () => {
  await startServers();
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
  process.exit(1);
}
