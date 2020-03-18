const http = require("http");
const nStatic = require("node-static");
const exec = require("./exec");

const port = process.env.IMAGE_PORT || "8081";

let count = 0;

module.exports.start = path => {
  const fileServer = new nStatic.Server(path);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async function(req, res) {
      fileServer.serve(req, res);
      count++;
      console.log(count);
      if (count > 3) {
        throw new Error("Failed");
      }

      let results = await exec.readImages();
      await exec.compareBrowsers(results);
      console.log("Status OK");
    });

    server.on("error", error => {
      console.error("Error:", error);
      reject(error);
    });

    server.listen(port, () => {
      console.log("Server OK");
      resolve(port);
    });
  });
};
