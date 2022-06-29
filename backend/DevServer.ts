import http from "node:http";
import { URL } from "node:url";

const server = http.createServer((req, res) => {
  let attempts = 0,
    warningLogged = false;

  attemptProxyRequest();

  async function attemptProxyRequest() {
    if (++attempts > 60) {
      console.log(
        "Proxy server is giving up on waiting for backend to boot up"
      );
      res.statusCode = 502;
      res.statusMessage = "Bad Gateway";
      res.setHeader("content-type", "application/json");
      res.write(
        JSON.stringify({
          error: "Proxy Server unable to reach baseplate web app server",
        })
      );
      res.end();
      return;
    }

    const url = new URL(req.url!, "http://localhost:7601");
    let proxyResponse;
    try {
      const proxyReqHeaders = { ...req.headers };
      delete proxyReqHeaders.connection;
      proxyResponse = await fetch(url.href, {
        // @ts-ignore
        headers: proxyReqHeaders,
      });
    } catch (err) {
      console.error(err);
      if (!warningLogged) {
        warningLogged = true;
        console.log("Proxy server waiting for nodemon restart to complete");
      }
      setTimeout(attemptProxyRequest, 50);
      return;
    }

    proxyResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.statusCode = proxyResponse.status;
    res.statusMessage = proxyResponse.statusText;

    if (proxyResponse.body) {
      const reader = await proxyResponse.body.getReader();
      let done = false;
      while (!done) {
        const data = await reader.read();
        if (data.done) {
          res.end();
          done = true;
        } else {
          res.write(data.value);
        }
      }
    } else {
      res.end();
    }
  }
});

console.log("Starting proxy server");
server.listen(7600);
