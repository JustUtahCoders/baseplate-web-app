import { FunctionComponent } from "react";
import { inBrowser } from "../Utils/browserHelpers";

let loadDocModule: (url: string) => Promise<DocModule>;
let webpackContext: __WebpackModuleApi.RequireContext;

if (inBrowser) {
  webpackContext = require.context("../../docs", true, /\.mdx?$/);
  loadDocModule = async (url: string) => {
    return webpackContext("./" + url);
  };
} else {
  loadDocModule = (url: string) => import(`../../docs/${url}`);
}

export { loadDocModule };

interface DocModule {
  default: FunctionComponent;
  pageTitle?: string;
}

interface DocsHierarchy {
  directories: DocsHierarchy[];
  files: string[];
}
