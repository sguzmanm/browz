const http = require("http");
const nStatic = require("node-static");
const port = process.env.HTTP_PORT || "8080";
const httpPath = process.env.HTTP_APP_DIR || "/app";

module.exports.start = () => {
  const fileServer = new nStatic.Server(httpPath);

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
