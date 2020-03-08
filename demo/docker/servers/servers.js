const { spawn } = require("child_process");

const HttpServer = require("./http/http-server");
const ImageServer = require("./images/image-server");

module.exports.getServerExecs = dir => {
  console.log("DIR");
  return [
    HttpServer.start(dir, () => {
      process.exit(1);
    }),
    ImageServer.start(dir, () => {
      process.exit(1);
    })
  ];
  /*return[   
        startCommand('node',[__dirname+'/http/http-server.js',dir],process.exit(1)),
        startCommand('node',[__dirname+'/images/image-server.js',dir],process.exit(1))
    ]*/
};
