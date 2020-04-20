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

logger.log = (...messages) => {
    console.log(getMessage(messages));
};

logger.logInfo = (...messages) => {
    console.log(`${logger.context}>>[INFO]:${getMessage(messages)}`);
};

logger.logWarning = (...messages) => {
    console.log(`${logger.context}>>[WARNING]:${getMessage(messages)}`);
};
logger.logError = (...messages) => {
    console.error(`${logger.context}>>[ERROR]:${getMessage(messages)}`);
};
