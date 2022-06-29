import httpProxy from "http-proxy";
import http from "node:http";

const proxy = httpProxy.createProxyServer({});
const server = http.createServer((req, res) => {
  req.setMaxListeners(100);
  let attempts = 0,
    warned = false;

  attemptProxy();

  function attemptProxy() {
    proxy.web(
      req,
      res,
      {
        target: "http://localhost:7601",
      },
      (err) => {
        if (++attempts > 30) {
          console.log(
            "Proxy server giving up after 30 attempts to connect to baseplate-web-app backend server"
          );
        } else {
          if (warned) {
            console.log(
              "Proxy server waiting for baseplate-web-app backend server to become healthy"
            );
          }
          setTimeout(attemptProxy, 50);
        }
      }
    );
  }
});

console.log("starting proxy server");
server.listen(7600);
