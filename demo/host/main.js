const { spawn } = require("child_process");
const linuxContainer =
  process.env.LINUX_CONTAINER || "sguzmanm/linux_playwright_tests:latest";

const ERR_EMPTY_DIR = new Error("Empty app dir");

const dir = process.argv[2];
if (!dir || dir.trim() === "") {
  console.error(ERR_EMPTY_DIR);
  return;
}

const runContainer = () => {
  const spawnElement = spawn("docker", ["run", linuxContainer]);
  spawnElement.stdout.on("data", data => {
    console.log(`child stdout:\n${data}`);
  });

  spawnElement.stderr.on("data", data => {
    console.error(`child stderr:\n${data}`); //TODO: How are we gonna define errors?
    console.error("Ending app now");
    process.exit(1);
  });
};

const main = async () => {
  const spawnElement = spawn("docker", ["pull", linuxContainer]);
  spawnElement.stdout.on("data", async data => {
    console.log(`child stdout:\n${data}`);
    if (
      data
        .toString()
        .trim()
        .includes(linuxContainer)
    ) {
      console.log("Resolved");
      await runContainer();
      console.log("Run");
      runContainer();
    }
  });

  spawnElement.stderr.on("data", data => {
    console.error(`child stderr:\n${data}`); //TODO: How are we gonna define errors?
    console.error("Ending app now");
    process.exit(1);
  });
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
}
