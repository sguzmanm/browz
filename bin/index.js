// Two main params, http source and image destination

const { setupDocker, runDocker, killDocker } = require('../src/docker-manager/docker-manager');
const { createReport } = require('../src/report-manager/report-manager');

const EMPTY_DIR_MSG = 'Empty dir provided for server:';

const httpSource = process.argv[2];
if (!httpSource || httpSource.trim() === '') {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, 'Http');
}

const imagesDestination = process.argv[3];
if (!imagesDestination || imagesDestination.trim() === '') {
  // eslint-disable-next-line no-undef
  console.error(EMPTY_DIR_MSG, 'Image');
}

const finishProcess = async (success) => {
  await killDocker();

  if (success) {
    process.exit(0);
  }

  process.exit(1);
};

const main = async () => {
  try {
    console.log('-----Setup Container-----');
    await setupDocker();
    console.log('----Run Container-------');
    await runDocker(httpSource, imagesDestination);
    console.log('-----Create Report--------');
    await createReport();
    console.log('-----Finish process-------');
    await finishProcess(true);
  } catch (error) {
    console.error('Error running container code', error);
    throw error;
  }
};

process.on('unhandledRejection', (error) => {
  // Won't execute
  console.log('-----Finish process with unhandled error-------');
  console.error(error);
  finishProcess(false);
});


try {
  main();
} catch (error) {
  console.log('-----Finish process with error-------');
  finishProcess(false);
}
