const { getServerExecs } = require("./servers/servers");
const { exploreApp } = require("./playwright/exec");
const ERR_EMPTY_DIR = new Error("Empty app dir");

const dir = process.argv[2];
if (!dir || dir.trim() === "") {
  console.error(ERR_EMPTY_DIR);
  return;
}

const startServers = async () => {
  console.log("Test");
  const execs = getServerExecs(dir);
  console.log(execs);
  const results = await Promise.all(execs);
  console.log("WAITING...");
  console.log(results);
};

const main = async () => {
  await startServers();
  await exploreApp();
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
}
