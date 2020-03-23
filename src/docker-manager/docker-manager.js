const { spawn } = require("child_process");
const os = require("os");
const readline = require("readline");

const linuxContainer =
  process.env.LINUX_CONTAINER || "sguzmanm/linux_playwright_tests:latest";
const httpAppDir = process.env.HTTP_APP_DIR || "/app";
const snapshotDir = process.env.SNAPSHOT_DESTINATION_DIR || "/app";

const UNIT_MB = "Mi";
const IMAGE_MEMORY_THRESHOLD = 200 * Math.pow(2, 20); // 200MB
const checkImageMemoryCmd = `docker --config ./ manifest inspect -v ${linuxContainer} | grep size | awk -F ':' '{sum+=$NF} END {print sum}' | numfmt --to=iec-i`;
let containerName;

const askQuestion = query => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
};

const checkImageMemory = () => {
  if (process.platform === "win32") {
    return "0";
  }

  const spawnElement = spawn("sh", ["-c", checkImageMemoryCmd]);
  return new Promise((resolve, reject) => {
    let dataLine = "";
    spawnElement.stdout.on("data", data => {
      dataLine = data.toString().split(UNIT_MB);
      console.log(dataLine);
      if (dataLine.length > 1) {
        console.log("Resolved");
        resolve(dataLine[0]);
      }
    });

    spawnElement.stderr.on("data", data => {
      console.error(data);
      reject(`Error checking available memory to pull image: ${data}`);
    });
  });
};

const convertMBtoBytes = mb => {
  return mb * Math.pow(2, 20);
};

const pullImage = async () => {
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

module.exports.setupDocker = async () => {
  let compressedImageMem = await checkImageMemory();
  compressedImageMem = convertMBtoBytes(
    parseInt(compressedImageMem.split(UNIT_MB)[0], 10)
  );

  if (compressedImageMem > os.freemem()) {
    let answer = await askQuestion(
      `You need ${compressedImageMem -
        os.freemem()} MB to install our current image. If the process continues the app will probably fail. Do you still want to go on? (y/N)`
    );
    if (answer.toLowerCase() !== "y" && answer !== "") {
      throw new Error(
        "Pull image process stopped by user, please review necessary requirements"
      );
    }
  }

  await pullImage();
};

const executeContainer = (containerName, httpSource, imageDestination) => {
  const spawnElement = spawn("docker", [
    "run",
    "--name",
    containerName,
    "-v",
    `${httpSource}:${httpAppDir}`,
    "-v",
    `${imageDestination}:${snapshotDir}`,
    linuxContainer
  ]);

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

// Run docker with volume params
module.exports.runDocker = async (httpSource, imageDestination) => {
  if (os.freemem() < IMAGE_MEMORY_THRESHOLD) {
    let answer = await askQuestion(
      `Your free memory is less than our suggested threshold of ${IMAGE_MEMORY_THRESHOLD} MB for running the docker. Do you still want to go on? (y/N)`
    );
    if (answer.toLowerCase() !== "y" && answer !== "") {
      throw new Error(
        "Run image process stopped by user, please review necessary requirements"
      );
    }
  }

  containerName = `${linuxContainer}_${httpSource}_${new Date().getTime()}`;
  await executeContainer(containerName, httpSource, imageDestination);
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
