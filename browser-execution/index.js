const http = require("http");
const { getServerExecs } = require("./servers/servers");
const { exploreApp } = require("./exploration/playwright/exec");
const port = process.env.IMAGE_PORT || "8081";

const EMPTY_DIR_MSG = "Empty dir provided for server:";

const startServers = async () => {
  const execs = getServerExecs(httpDir);
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

let httpDir = process.env.HTTP_APP_DIR || "/app";
if (!httpDir) {
  httpDir = process.argv[2];
  if (!httpDir || httpDir.trim() === "") {
    console.error(EMPTY_DIR_MSG, "Http");
    return;
  }
}

let imageDir = process.env.IMAGE_APP_DIR || "/screenshots";
if (!imageDir) {
  imageDir = process.argv[3];
  if (!imageDir || imageDir.trim() === "") {
    console.error(EMPTY_DIR_MSG, "Image");
    return;
  }
}

try {
  main();
} catch (error) {
  console.error("ERROR", error);
  process.exit(1);
}
