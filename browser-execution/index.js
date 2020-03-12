const http = require("http");
const { getServerExecs } = require("./servers/servers");
const { exploreApp } = require("./exploration/playwright/exec");
const port = process.env.IMAGE_PORT || "8081";

const ERR_EMPTY_DIR = new Error("Empty app dir");
let dir = process.env.HTTP_APP_DIR || "/app";

if (!dir) {
  dir = process.argv[2];
  if (!dir || dir.trim() === "") {
    console.error(ERR_EMPTY_DIR);
    return;
  }
}

const startServers = async () => {
  const execs = getServerExecs(dir);
  console.log(execs);
  const results = await Promise.all(execs);
  console.log(results);
};

const main = async () => {
  await startServers();
  await exploreApp();

  console.log("Request..", port);
  http.get("http://localhost:" + port, resp => {
    console.log(!"RESP", resp);
  });
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
}
