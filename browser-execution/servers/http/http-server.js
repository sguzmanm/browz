const http = require("http");
const nStatic = require("node-static");

const port = process.env.HTTP_PORT || "8080";

module.exports.start = path => {
  const fileServer = new nStatic.Server(path);

  return new Promise((resolve, reject) => {
    const server = http.createServer(function(req, res) {
      fileServer.serve(req, res);
    });

    server.on("error", error => {
      console.error("Error:", error);
      reject(error);
    });

    server.listen(port, () => {
      console.log("HTTP Server OK");
      resolve(port);
    });
  });
};
