import "./InitDB";
import { router } from "./Router";
import "./RouteImports";
import express, { Express } from "express";
import bodyParser from "body-parser";
import kill from "tree-kill";
import open from "open";

export const app: Express = express();
app.use(bodyParser.json());
app.use(router);

if (process.env.NODE_ENV !== "db-tests") {
  const port = process.env.PORT || 7600;

  app.listen(port);

  const fullUrl = `http://localhost:${port}`;
  console.log(`Listening on ${fullUrl}`);

  // https://github.com/remy/nodemon/issues/1247
  const pid = process.pid;
  process.on("SIGINT", function () {
    kill(pid, "SIGTERM");
    process.exit();
  });

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.BASEPLATE_OPEN === "true"
  ) {
    delete process.env.BASEPLATE_OPEN;
    open(fullUrl);
  }
}
