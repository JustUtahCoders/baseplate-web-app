import { Response } from "express";
import { createElement } from "react";
import ReactDOMServer from "react-dom/server";
import { App, AppProps, RouterContext } from "../../frontend/App";

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

  let didError = false;
  const stream = ReactDOMServer.renderToPipeableStream(
    createElement(App, props),
    {
      onShellReady() {
        res.status(didError ? 500 : 200);
        res.setHeader("content-type", "text/html");
        res.write("<!DOCTYPE html><html>");
        stream.pipe(res);
      },
      onShellError(error) {
        console.error(error);
        res.status(500).send("<!DOCTYPE html><html>Server error</html>");
      },
      onError(err) {
        console.error(err);
        didError = true;
      },
    }
  );

  if (routerContext.url) {
    return res.redirect(routerContext.url);
  }
};
