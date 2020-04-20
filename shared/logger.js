const logger = exports; // FIXME: Why does thihs have to be exported like this?

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

const log = (...messages) => {
    console.log(getMessage(messages));
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

logger.newInstance = (context) => ({
    context?context: "Default",
    log,
    logInfo: (messages) => logInfo(context, messages),
    logWarning: (messages) => logWarning(context, messages),
    logError: (messages) => logError(context, messages),
});
