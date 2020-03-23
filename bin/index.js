// Two main params, http source and image destination

const {
  setupDocker,
  runDocker,
  killDocker
} = require("../src/docker-manager/docker-manager");
const { createReport } = require("../src/report-manager/report-manager");

const EMPTY_DIR_MSG = "Empty dir provided for server:";

const httpSource = process.argv[2];
if (!httpSource || httpSource.trim() === "") {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, "Http");
  return;
}

const imagesDestination = process.argv[3];
if (!imagesDestination || imagesDestination.trim() === "") {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, "Image");
  return;
}

const main = async () => {
  console.log("-----Setup Container-----");
  await setupDocker();
  console.log("----Run Container-------");
  await runDocker(httpSource, imagesDestination);
  console.log("-----Create Report--------");
  await createReport();
  console.log("-----Finish process-------");
  await finishProcess();
};

const finishProcess = async () => {
  await killDocker();
  process.exit(1);
};

try {
  main();
} catch (error) {
  console.error("ERROR", error);
  finishProcess();
}
