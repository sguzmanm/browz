
const cypressHandlerErrors = [
    'The automation client disconnected. Cannot continue running tests.',
    'Protocol disconnected',
];

// Add all outputs not closing error stream on docker execution
module.exports.getWrongOutputMessage = (output) => {
    const cypressErrorText = cypressHandlerErrors.find((el) => el === output);
    if (cypressErrorText) {
        return `Cypress Handler: ${cypressErrorText}`;
    }

    return undefined;
};
