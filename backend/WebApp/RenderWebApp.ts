import { Response } from "express";
import { createElement } from "react";
import ReactDOMServer from "react-dom/server";
import { App, AppProps, SSRResult, UserInformation } from "../../frontend/App";
import url from "url";
import { renderFile, render } from "ejs";
import fs from "fs";
import merge2 from "merge2";
import { Duplex } from "stream";
import { CustomerOrgModel } from "../DB/Models/CustomerOrg/CustomerOrg";
import { UserPreferencesAttributes } from "../DB/Models/User/UserPreferences";

const webAppIntro = url.fileURLToPath(
  new URL("./WebAppIntro.ejs", import.meta.url).href
);
const webAppOutro = url.fileURLToPath(
  new URL("./WebAppOutro.ejs", import.meta.url).href
);
const internalErrorHTML = render(
  fs.readFileSync(
    url.fileURLToPath(
      new URL("./WebAppInternalError.ejs", import.meta.url).href
    ),
    "utf-8"
  ),
  {}
);

export const renderWebApp = async (req, res: Response) => {
  const ssrResult: SSRResult = {
    ejsData: {
      pageTitle: "Baseplate",
    },
  };

  const isProd = process.env.NODE_ENV === "production";

  let webpackManifest = {};

  if (isProd) {
    // @ts-ignore
    webpackManifest = (await import("../webpack-manifest.json")).default;
  }

  const userInformation: UserInformation = {
    userPreferences: req.baseplateAccount
      ?.userPreferences as UserPreferencesAttributes,
    isLoggedIn: Boolean(req.baseplateAccount),
  };

  if (userInformation.isLoggedIn) {
    const matchResult = /\/console\/(.+?)\/.+/.exec(req.url);
    if (matchResult) {
      const customerOrgId = matchResult[1];
      const customerOrg = await CustomerOrgModel.findByPk(customerOrgId);
      userInformation.orgKey = customerOrg?.orgKey;
    }
  }

  const rootProps: AppProps = {
    userInformation,
    ssrResult,
    reqUrl: req.url,
  };

  const ejsData = {
    assetBase: isProd
      ? "https://storage.googleapis.com/baseplate/dist"
      : "http://localhost:7700",
    cssFiles: [isProd ? webpackManifest["main.css"] : "main.css"],
    jsFiles: [isProd ? webpackManifest["main.js"] : "baseplate-web-app.js"],
  };

  let didError = false;
  const reactReadable = ReactDOMServer.renderToPipeableStream(
    createElement(App, rootProps),
    {
      async onShellReady() {
        if (ssrResult.redirectUrl) {
          reactReadable.abort();
          res.redirect(ssrResult.redirectUrl);
        } else if (didError) {
          sendInternalError();
        } else {
          if (ssrResult.ejsData.pageTitle instanceof Promise) {
            ssrResult.ejsData.pageTitle = await ssrResult.ejsData.pageTitle;
          }

          Object.assign(ejsData, ssrResult.ejsData, {
            rootProps: JSON.stringify(rootProps),
          });
          res.setHeader("content-type", "text/html");

          const introHTMLReadable = new Duplex();
          renderFile(webAppIntro, ejsData, { cache: true }, (err, html) => {
            if (err) {
              console.error("Error rendering EJS");
              console.error(err);
            } else {
              introHTMLReadable.push(html);
            }

            introHTMLReadable.push(null);
          });

          const outroHTMLReadable = new Duplex();
          renderFile(webAppOutro, ejsData, { cache: true }, (err, html) => {
            if (err) {
              console.error("Error rendering EJS");
              console.error(err);
            } else {
              outroHTMLReadable.push(html);
            }

            outroHTMLReadable.push(null);
          });

          const finalReadable = merge2(
            introHTMLReadable,
            // @ts-ignore
            reactReadable,
            outroHTMLReadable
          );

          finalReadable.pipe(res);
        }
      },
      onShellError(error) {
        console.error(error);
        sendInternalError();
      },
      onError(err) {
        console.error(err);
        didError = true;
      },
    }
  );

  function sendInternalError() {
    res.status(500);
    res.setHeader("content-type", "text/html");
    res.write(internalErrorHTML);
    res.end();
  }
};
