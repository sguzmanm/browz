const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { getServerExecs } = require("./servers/servers");
const { exploreApp } = require("./exploration/playwright/exec");
const port = process.env.IMAGE_PORT || "8081";

const startServers = async () => {
  const execs = getServerExecs();
  console.log(execs);
  const results = await Promise.all(execs);
  console.log(results);
};

const main = async () => {
  await startServers();
  /*await exploreApp();

  console.log("Request..", port);
  http.get("http://localhost:" + port, resp => {
    console.log(!"RESP", resp);
  });*/
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
  process.exit(1);
}
