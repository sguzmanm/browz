const fs = require('fs');
const http = require('http');
const nStatic = require('node-static');

const port = process.env.HTTP_PORT || '8080';
const httpPath = process.env.HTTP_APP_DIR || '../../app';

module.exports.start = () => {
  console.log(httpPath);

  if (!fs.existsSync(`${httpPath}/index.html`)) {
    console.error('No index.html file found');
    throw new Error('No index.html file found');
  }

  const fileServer = new nStatic.Server(httpPath);
  const server = http.createServer((req, res) => {
    console.log('serve...');
    const ans = fileServer.serve(req, res);
    console.log(ans);
  });

  server.on('error', (error) => {
    console.error('Http Server Error:', error);
    throw new Error('Http Server Error:', error.message);
  });

  server.listen(port, () => {
    console.log('Start http server', port);
  });
};
