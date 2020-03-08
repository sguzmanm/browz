const http = require("http");
const nStatic = require("node-static");

const port = process.env.HTTP_PORT || "8080";

let count = 0;

module.exports.start = (path, reject) => {
  const fileServer = new nStatic.Server(path);

  return new Promise(resolve => {
    const server = http.createServer(function(req, res) {
      fileServer.serve(req, res);
      count++;
      console.log(count);
      if (count > 3) {
        throw new Error("Failed");
      }
    });

    server.on("error", error => {
      console.log("Error:", error);
      reject(error);
    });

    server.listen(port, () => {
      console.log("HTTP Server OK");
      resolve(port);
    });
  });
};
