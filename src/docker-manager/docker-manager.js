const { spawn } = require("child_process");
const linuxContainer =
  process.env.LINUX_CONTAINER || "sguzmanm/linux_playwright_tests:latest";
const httpAppDir = process.env.HTTP_APP_DIR || "/app";

module.exports.setupDocker = () => {
  const spawnElement = spawn("docker", ["pull", linuxContainer]);
  return new Promise((resolve, reject) => {
    spawnElement.stdout.on("data", data => {
      console.log(`child stdout:\n${data}`);
      if (
        data
          .toString()
          .trim()
          .includes(linuxContainer)
      ) {
        console.log("Resolved");
        resolve(data);
      }
    });

    spawnElement.stderr.on("data", data => {
      console.error(data);
      reject(`Error setting up docker container ${data}`);
    });
  });
};

module.exports.runDocker = dir => {
  const spawnElement = spawn("docker", [
    "run",
    "--env",
    "IMGBBKEY=54bf51261cae0f13aacb6de2dddb367b",
    "-v",
    `${dir}:${httpAppDir}`,
    linuxContainer,
    "node",
    "/tmp/thesis/demo/docker/main.js"
  ]); // TODO: Edit command for running docker

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on("data", data => {
      console.log(`child stdout:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on("data", data => {
      reject(`Error executing docker container ${data}`);
    });
  });
};

module.exports.killDocker = () => {
  const spawnElement = spawn("docker", ["rm", "--force", linuxContainer]); // TODO: Edit command for running docker

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on("data", data => {
      console.log(`child stdout:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on("data", data => {
      reject(`Error executing docker container ${data}`);
    });
  });
};
