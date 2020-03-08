const { spawn } = require("child_process");

const HttpServer = require("./http/http-server");
const ImageServer = require("./images/image-server");

const startCommand = (mainCommand, args, cancelCbck) => {
  console.log(mainCommand);
  const processSpawn = spawn(mainCommand, args);
  return new Promise((resolve, reject) => {
    processSpawn.stdout.on("data", data => {
      console.log(`child stdout:\n${data}`);
      if (data.toString().trim() === "Server OK") {
        console.log("Resolved");
        resolve(data);
      }
    });

    processSpawn.stderr.on("data", error => {
      console.error(`child stderr:\n${error}`); //TODO: How are we gonna define errors?
      console.error("Ending app now");
      reject(error);
      cancelCbck(error);
    });
  });
};

module.exports.getServerExecs = async dir => {
  console.log("DIR");
  const http = await HttpServer.start(dir, process.exit(1));
  const image = await ImageServer.start(dir, process.exit(1));

  console.log(http);
  console.log(image);
  return [http, image];
  /*return[   
        startCommand('node',[__dirname+'/http/http-server.js',dir],process.exit(1)),
        startCommand('node',[__dirname+'/images/image-server.js',dir],process.exit(1))
    ]*/
};
