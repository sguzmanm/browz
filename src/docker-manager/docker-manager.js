const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

const logger = require('../../shared/logger').newInstance('Docker Manager');
const { container } = require('../../shared/config.js').getHostConfig();
const { getDockerErrorCodeMessage, getWrongOutputMessage } = require('./error-outputs');

const linuxContainer = container && container.name ? container.name : 'sguzmanm/linux_cypress_tests:lite';
const httpAppDir = container && container.httpAppDir ? container.httpAppDir : '/tmp/app';
const snapshotDir = container && container.snapshotDestinationDir ? container.snapshotDestinationDir : '/tmp/runs';
const containerConfigDir = container && container.configDir ? container.configDir : '/tmp/config';

const hostConfigDir = path.join(__dirname, '../../config');

const UNIT_MB = 'Mi';
const ENV_PARAM = '--env';
const LEVEL_ENV_VAR = 'LEVEL';
const CONTAINER_NAME = 'thesis';

const MAX_MEMORY_GB = 2;
const IMAGE_MEMORY_BYTES_THRESHOLD = 200 * 10 ** 6; // 200MB
const ESTIMATED_IMAGE_SIZE_MB = 1.99 * 10 ** 3; // 1.99 GB

const checkImageMemoryCmd = `docker --config ${`${__dirname}/config`} manifest inspect -v ${linuxContainer} | grep size | awk -F ':' '{sum+=$NF} END {print sum}' | numfmt --to=iec-i`;

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

const checkImageMemory = () => {
  if (process.platform === 'win32') {
    return '0';
  }

  const spawnElement = spawn('sh', ['-c', checkImageMemoryCmd]);
  return new Promise((resolve, reject) => {
    let dataLine = '';
    spawnElement.stdout.on('data', (data) => {
      dataLine = data.toString().split(UNIT_MB);
      if (dataLine.length > 1) {
        resolve(dataLine[0]);
      }
    });

    spawnElement.stderr.on('data', (data) => {
      logger.logError(`Error checking available memory to pull image: ${data}`);
      reject(
        new Error(`Error checking available memory to pull image: ${data}`),
      );
    });
  });
};

const pullImage = async () => {
  const spawnElement = spawn('docker', ['pull', linuxContainer]);
  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      logger.logInfo(`Docker image pull output:\n ${data}`);
      if (data.toString().trim().includes(linuxContainer)) {
        logger.logInfo('Image successfully pulled');
        resolve(data);
      }
    });

    spawnElement.stderr.on('data', (data) => {
      logger.logError(`Error setting up docker container ${data}`);
      reject(new Error(`Error setting up docker container ${data}`));
    });
  });
};

module.exports.setupDocker = async () => {
  let dockerImageSize = await checkImageMemory();
  dockerImageSize = parseInt(dockerImageSize.split(UNIT_MB)[0], 10);

  const fraction = dockerImageSize / ESTIMATED_IMAGE_SIZE_MB;
  // Use an estimate since we do not have access to the uncompressed image size
  let approximateImageMem = dockerImageSize
    * (1 + fraction > 0.5 ? fraction : (fraction + 0.5));
  let unit = 'MB';

  if (approximateImageMem > os.freemem()) {
    const requiredMemory = approximateImageMem - os.freemem();

    const answer = await askQuestion(
      `You need ${requiredMemory} MB to install our current image. If the process continues the app will probably fail. Do you still want to go on? (y/N)`,
    );
    if (answer.toLowerCase() !== 'y' && answer !== '') {
      logger.logWarning('Pull image process stopped by user, please review necessary requirements');
      throw new Error(
        'Pull image process stopped by user, please review necessary requirements',
      );
    }
  }

  if (approximateImageMem >= 1000) {
    approximateImageMem /= 1000;
    unit = 'GB';
  }

  logger.logInfo(`The image will occupy at least ${approximateImageMem} ${unit} of your disk`);

  await pullImage();
};

/*
 * Command example: docker run --shm-size=512 -v /httpDir:/tmp/app /imageDir:/tmp/screenshots
 * --env-file="../.env" sguzmanm/linux_cypress_tests:lite sh -c cd /tmp/thesis && git reset
 * --hard HEAD && git pull origin master && cd browser-execution && npm install && node index.js
 */
const executeContainer = (httpSource, imageDestination, level) => {
  const commands = [
    'run',
    '--shm-size=512m',
    '-m',
    `${MAX_MEMORY_GB}GB`,
    '-v',
    `${httpSource}:${httpAppDir}`,
    '-v',
    `${imageDestination}:${snapshotDir}`,
    '-v',
    `${hostConfigDir}:${containerConfigDir}`,
    ENV_PARAM,
    `${LEVEL_ENV_VAR}=${level}`,
    '--name',
    CONTAINER_NAME,
    linuxContainer,
    'sh',
    '-c',
    'cd /tmp/thesis && git reset --hard HEAD && git pull origin master && cd browser-execution && npm install && node index.js',
  ];

  logger.logDebug('Run docker image command');
  logger.logDebug(commands.join(' '));
  const spawnElement = spawn('docker', commands);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      const wrongOutputMessage = getWrongOutputMessage(data);
      if (wrongOutputMessage) {
        logger.logError(`Container execution failed with error: ${wrongOutputMessage}`);
        reject(new Error(`Container execution failed with error: ${wrongOutputMessage}`));
      }
      logger.log(`Info stream: ${data}`);
    });

    spawnElement.stderr.on('data', (data) => {
      const wrongOutputMessage = getWrongOutputMessage(data);
      if (wrongOutputMessage) {
        logger.logError(`Container execution failed with error: ${wrongOutputMessage}`);
        reject(new Error(`Container execution failed with error: ${wrongOutputMessage}`));
      }
      logger.log(`Secondary stream: ${data}`);
    });

    spawnElement.on('close', (code) => {
      if (code !== 0) {
        logger.logError(`Container execution failed with exit code: ${getDockerErrorCodeMessage(code)} (Code:${code})`);
        reject(new Error(`Container execution failed with exit code: ${getDockerErrorCodeMessage(code)} (Code:${code})`));
      }

      logger.logInfo('Container execution closed successfully');
    });

    spawnElement.on('exit', (code, signal) => {
      if (!code && signal) {
        logger.logError(`Container execution finished with error signal: ${signal}`);
        reject(new Error(`Container execution finished with error signal: ${signal}`));
      }

      if (code !== 0) {
        logger.logError(`Container execution finished with exit code: ${getDockerErrorCodeMessage(code)} (Code:${code})`);
        reject(new Error(`Container execution finished with exit code: ${getDockerErrorCodeMessage(code)} (Code:${code})`));
      }

      logger.logInfo('Container execution finished successfully');
      resolve(code);
    });
  });
};

// Run docker with volume params
module.exports.runDocker = async (httpSource, imageDestination, level) => {
  if (os.freemem() < IMAGE_MEMORY_BYTES_THRESHOLD) {
    logger.logInfo('Docker requirements for running image');

    const answer = await askQuestion(
      `Your free memory is less than our suggested threshold of ${IMAGE_MEMORY_BYTES_THRESHOLD} MB for running the docker. Do you still want to go on? (y/N)`,
    );

    if (answer.toLowerCase() !== 'y' && answer !== '') {
      logger.logError('Run image process stopped by user, please review necessary requirements');
      throw new Error(
        'Run image process stopped by user, please review necessary requirements',
      );
    }
  }

  await executeContainer(httpSource, imageDestination, level);
};

module.exports.killDocker = () => {
  const spawnElement = spawn('docker', ['rm', '--force', CONTAINER_NAME]);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      logger.logInfo(`Docker process stopped successfully:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on('data', (data) => {
      if (!data.includes('No such container:')) {
        logger.logError(`Error stopping docker container ${data}`);
        reject(new Error(`Error stopping docker container ${data}`));
      }
    });
  });
};
