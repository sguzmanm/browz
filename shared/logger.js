/* eslint-disable no-console */
const getMessage = (args) => {
  let fullMessage = '';
  let message;
  for (let i = 0; i < args.length; i += 1) {
    message = args[i];
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
      fullMessage += `${message}\n`;
    }

    fullMessage += `${message} `;
  }

  return fullMessage;
};

const [DEBUG, INFO, WARNING, ERROR] = [0, 1, 2, 3];
const validLevels = [true, true, true, true]; // Corresponds to the constants in the line above

// Add possible args for logging here
const argsFromLevel = {
  '--verbose': DEBUG,
  '--errors': ERROR,
};

let level = INFO;

module.exports.setLevel = (currentLevel) => {
  if (!validLevels[currentLevel]) { return; }
  level = currentLevel;
};

module.exports.setLevelWithFlags = (args) => {
  let currentLevel;
  args.forEach((arg) => {
    if (argsFromLevel[arg] && !currentLevel) {
      currentLevel = argsFromLevel[arg];
    }
  });

  level = currentLevel && validLevels[currentLevel] ? currentLevel : DEBUG;
};

const log = (...messages) => {
  console.log(getMessage(messages));
};

const logDebug = (context, ...messages) => {
  console.log(`${context}>>[DEBUG]:${getMessage(messages)}`);
};

const logInfo = (context, ...messages) => {
  console.log(`${context}>>[INFO]:${getMessage(messages)}`);
};

const logWarning = (context, ...messages) => {
  console.log(`${context}>>[WARNING]:${getMessage(messages)}`);
};
const logError = (context, ...messages) => {
  console.error(`${context}>>[ERROR]:${getMessage(messages)}`);
};

module.exports.newInstance = (context) => {
  const loggingContext = context || 'Default';

  return {
    context,
    level,
    log,
    logDebug: (messages) => (level <= DEBUG ? logDebug(loggingContext, messages) : undefined),
    logInfo: (messages) => (level <= INFO ? logInfo(loggingContext, messages) : undefined),
    logWarning: (messages) => (level <= WARNING ? logWarning(loggingContext, messages) : undefined),
    logError: (messages) => (level <= ERROR ? logError(loggingContext, messages) : undefined),
  };
};
