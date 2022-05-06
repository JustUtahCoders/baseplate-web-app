import { Response } from "express";
import { createElement } from "react";
import ReactDOMServer from "react-dom/server.js";
import { App, AppProps, RouterContext } from "../../frontend/App";
import { serverApiError } from "../Utils/EndpointResponses";

export const renderWebApp = async (req, res: Response) => {
  const routerContext: RouterContext = {};

  const isProd = process.env.NODE_ENV === "production";

  let webpackManifest = {};

  if (isProd) {
    // @ts-ignore
    webpackManifest = (await import("../webpack-manifest.json")).default;
  }

  const props: AppProps = {
    routerContext,
    reqUrl: req.url,
    assetBase: isProd
      ? "https://storage.googleapis.com/baseplate/dist"
      : "http://localhost:7700",
    cssFiles: [isProd ? webpackManifest["main.css"] : "main.css"],
    jsFiles: [isProd ? webpackManifest["main.js"] : "baseplate-web-app.js"],
  };

  let stream;
  try {
    stream = ReactDOMServer.renderToNodeStream(createElement(App, props));
  } catch (err) {
    console.log("ERROR", err);
    return serverApiError(res, "Unable to generate HTML");
  }

  if (routerContext.url) {
    return res.redirect(routerContext.url);
  }

  res.write("<!DOCTYPE html><html>");

  stream.on("error", (err) => {
    console.log("ERROR", err);
    res.end();
  });

  stream.on("end", () => {
    res.write("</html>");
    res.end();
  });

  stream.pipe(res, { end: false });
};
