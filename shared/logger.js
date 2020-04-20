const logger = exports;

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

logger.newInstance = (context) => {
    logger.context = context;
};

logger.logInfo = () => {
    // eslint-disable-next-line no-undef
    console.log(`${logger.context}>>[INFO]:${getMessage(arguments)}`);
};

logger.logWarning = () => {
    // eslint-disable-next-line no-undef
    console.log(`${logger.context}>>[WARNING]:${getMessage(arguments)}`);
};
logger.logError = () => {
    // eslint-disable-next-line no-undef
    console.error(`${logger.context}>>[ERROR]:${getMessage(arguments)}`);
};
