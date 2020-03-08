const { getServerExecs } = require("./servers/servers");
const { spawn } = require("child_process");
const linuxContainer =
  process.env.LINUX_CONTAINER || "linux_playwright_tests:latest";

const ERR_EMPTY_DIR = new Error("Empty app dir");

const dir = process.argv[2];
if (!dir || dir.trim() === "") {
  console.error(ERR_EMPTY_DIR);
  return;
}

const main = async () => {
  console.log("Test");
  const execs = getServerExecs(dir);
  const results = await Promise.all(execs);
  console.log("WAITING...");
  console.log(results);

  const element = spawn("docker", ["run -itd", linuxContainer]);
  element.stdout.on("data", data => {
    console.log(`child stdout:\n${data}`);
    if (data.toString().trim() === "Server OK") {
      console.log("Resolved");
    }
  });

  element.stderr.on("data", data => {
    console.error(`child stderr:\n${data}`); //TODO: How are we gonna define errors?
    console.error("Ending app now");
  });
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
}
