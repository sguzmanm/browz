const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const linuxContainer = process.env.LINUX_CONTAINER || 'sguzmanm/linux_cypress_tests:lite';
const httpAppDir = process.env.HTTP_APP_DIR || '/tmp/app';
const snapshotDir = process.env.SNAPSHOT_DESTINATION_DIR || '/tmp/screenshots';

const UNIT_MB = 'Mi';
const ENV_PARAM = 'env';
const IMAGE_MEMORY_THRESHOLD = 200 * (2 ** 20); // 200MB
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
      console.log(dataLine);
      if (dataLine.length > 1) {
        console.log('Resolved');
        resolve(dataLine[0]);
      }
    });

    spawnElement.stderr.on('data', (data) => {
      console.error(data);
      reject(new Error(`Error checking available memory to pull image: ${data}`));
    });
  });
};

const convertMBtoBytes = (mb) => mb * (2 ** 20);

const pullImage = async () => {
  const spawnElement = spawn('docker', ['pull', linuxContainer]);
  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
      if (
        data
          .toString()
          .trim()
          .includes(linuxContainer)
      ) {
        console.log('Resolved');
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
    const answer = await askQuestion(
      `You need ${compressedImageMem
        - os.freemem()} MB to install our current image. If the process continues the app will probably fail. Do you still want to go on? (y/N)`,
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
    data = fs.readFileSync(`${__dirname}/config/${file}`);
    data = JSON.parse(data);

    ans.push(ENV_PARAM);
    ans.push(`${configFiles[file]}=${data}`);
  });

  return ans;
};

/*
* Command example: docker run --shm-size=512 -v /httpDir:/tmp/app /imageDir:/tmp/screenshots
* --env-file="../.env" sguzmanm/linux_cypress_tests:lite sh -c cd /tmp/thesis && git reset
* --hard HEAD && git pull origin master && cd browser-execution && node index.js
*/
const executeContainer = (httpSource, imageDestination) => {
  const envFile = '../.env';
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
    linuxContainer,
    'sh',
    '-c',
    'cd /tmp/thesis && git reset --hard HEAD && git pull origin master && cd browser-execution && node index.js',
  ];

  console.log(commands.join(' '));
  const spawnElement = spawn('docker', commands);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on('data', (data) => {
      reject(new Error(`Error executing docker container ${data}`));
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
  const spawnElement = spawn('docker', ['rm', '--force', linuxContainer]);

  return new Promise((resolve, reject) => {
    spawnElement.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
      resolve(data);
    });

    spawnElement.stderr.on('data', (data) => {
      reject(new Error(`Error executing docker container ${data}`));
    });
  });
};
