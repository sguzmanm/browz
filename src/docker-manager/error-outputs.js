
const dockerErrorCodes = {
  0: 'Absence of an attached foreground process',
  1: 'Application error failure',
  125: 'Error while executing the Docker daemon',
  126: 'Contained command could not be invoked',
  127: 'Contained command cannot be found',
  137: 'Container received SIGKILL (Manual intervention or ‘oom-killer’ [OUT-OF-MEMORY])',
  139: 'Container received SIGSEGV',
  143: 'Container received SIGTERM',
};

module.exports.getDockerErrorCodeMessage = (code) => (dockerErrorCodes[code] ? dockerErrorCodes[code] : 'Internal docker execution error');

const cypressHandlerErrors = [
  'The automation client disconnected. Cannot continue running tests.',
];

// Add all outputs not closing error stream on docker execution
module.exports.getWrongOutputMessage = (output) => {
  return undefined;

  const cypressErrorText = cypressHandlerErrors.find((el) => output.includes(el));
  if (cypressErrorText) {
    return `Cypress Handler: ${cypressErrorText}`;
  }

  return undefined;
};
