const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const linuxContainer = process.env.LINUX_CONTAINER || 'sguzmanm/linux_cypress_tests:lite';
const httpAppDir = process.env.HTTP_APP_DIR || '/tmp/app';
const snapshotDir = process.env.SNAPSHOT_DESTINATION_DIR || '/tmp/runs';

const UNIT_MB = 'Mi';
const ENV_PARAM = '--env';
const CONTAINER_NAME = 'thesis';
const IMAGE_MEMORY_THRESHOLD = 200 * 2 ** 20; // 200MB
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
        console.log(`Image memory retrieved ${dataLine[0]}`);
        resolve(dataLine[0]);
      }
    });

    spawnElement.stderr.on('data', (data) => {
      console.error(data);
      reject(
        new Error(`Error checking available memory to pull image: ${data}`),
      );
    });
  });
};

const convertMBtoBytes = (mb) => mb * 2 ** 20;

const pullImage = async () => {
  const spawnElement = spawn('docker', ['pull', linuxContainer]);
  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
      if (data.toString().trim().includes(linuxContainer)) {
        console.log('Image successfully pulled');
        resolve(data);
      }
    });

    spawnElement.stderr.on('data', (data) => {
      console.error(data);
      reject(new Error(`Error setting up docker container ${data}`));
    });
  });
};

module.exports.setupDocker = async () => {
  let compressedImageMem = await checkImageMemory();
  compressedImageMem = convertMBtoBytes(
    parseInt(compressedImageMem.split(UNIT_MB)[0], 10),
  );

  if (compressedImageMem > os.freemem()) {
    const requiredMemory = compressedImageMem - os.freemem();
    const answer = await askQuestion(
      `You need ${requiredMemory} MB to install our current image. If the process continues the app will probably fail. Do you still want to go on? (y/N)`,
    );
    if (answer.toLowerCase() !== 'y' && answer !== '') {
      throw new Error(
        'Pull image process stopped by user, please review necessary requirements',
      );
    }
  }

  await pullImage();
};

const parseFilesAsEnvVariables = () => {
  const configFiles = {
    'resemble.json': 'CONFIG_RESEMBLE',
  };

  const ans = [];
  let data;
  Object.keys(configFiles).forEach((file) => {
    data = fs.readFileSync(`${__dirname}/config/${file}`, 'utf8');
    if (data.length > 0) {
      console.log(configFiles[file], data);
      ans.push(ENV_PARAM);
      ans.push(`${configFiles[file]}=${data}`);
    }
  });

  return ans;
};

/*
 * Command example: docker run --shm-size=512 -v /httpDir:/tmp/app /imageDir:/tmp/screenshots
 * --env-file="../.env" sguzmanm/linux_cypress_tests:lite sh -c cd /tmp/thesis && git reset
 * --hard HEAD && git pull origin master && cd browser-execution && npm install && node index.js
 */
const executeContainer = (httpSource, imageDestination) => {
  const envFile = `${__dirname}/config/.env`;
  const fileEnvVariables = parseFilesAsEnvVariables();
  const commands = [
    'run',
    '--shm-size=512m',
    '-v',
    `${httpSource}:${httpAppDir}`,
    '-v',
    `${imageDestination}:${snapshotDir}`,
    `--env-file=${envFile}`,
    ...fileEnvVariables,
    '--name',
    CONTAINER_NAME,
    linuxContainer,
    'sh',
    '-c',
    'cd /tmp/thesis && git reset --hard HEAD && git pull origin master && cd browser-execution && npm install && node index.js',
  ];

  console.log(commands.join(' '));
  const spawnElement = spawn('docker', commands);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`Docker logs >>\n${data}`);
    });

    spawnElement.stderr.on('data', (data) => {
      console.error(`Docker error >>\n${data}`);
    });

    spawnElement.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Container execution failed with exit code: ${code}`));
      }
    });

    spawnElement.on('exit', (code, signal) => {
      if (!code && signal) {
        reject(new Error(`Container execution finished with error signal: ${signal}`));
      }

      if (code !== 0) {
        reject(new Error(`Container execution finished with exit code: ${code}`));
      }

      console.log('Container execution finished');
      resolve(code);
    });
  });
};

// Run docker with volume params
module.exports.runDocker = async (httpSource, imageDestination) => {
  if (os.freemem() < IMAGE_MEMORY_THRESHOLD) {
    const answer = await askQuestion(
      `Your free memory is less than our suggested threshold of ${IMAGE_MEMORY_THRESHOLD} MB for running the docker. Do you still want to go on? (y/N)`,
    );
    if (answer.toLowerCase() !== 'y' && answer !== '') {
      throw new Error(
        'Run image process stopped by user, please review necessary requirements',
      );
    }
  }

  await executeContainer(httpSource, imageDestination);
};

module.exports.killDocker = () => {
  const spawnElement = spawn('docker', ['rm', '--force', CONTAINER_NAME]);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on('data', (data) => {
      if (!data.includes('No such container:')) {
        reject(new Error(`Error stopping docker container ${data}`));
      }
    });
  });
};
