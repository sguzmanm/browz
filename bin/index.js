const {
  setupDocker,
  runDocker,
  killDocker
} = require("../src/docker-manager/docker-manager");
const { createReport } = require("../src/report-manager/report-manager");

const EMPTY_DIR_MSG = "Empty dir provided for server:";

const httpDir = process.argv[2];
if (!httpDir || httpDir.trim() === "") {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, "Http");
  return;
}

const imagesDir = process.argv[3];
if (!imagesDir || imagesDir.trim() === "") {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, "Image");
  return;
}

const main = async () => {
  console.log("ONE");
  await setupDocker();
  console.log("TWO");
  await runDocker(httpDir);
  console.log("THREE");
  await killDocker();
  console.log("FOUR");
  await createReport();
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
  process.exit(1);
}
