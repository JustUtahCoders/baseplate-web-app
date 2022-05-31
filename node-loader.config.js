import * as tsNodeLoader from "ts-node/esm";
import { createLoader } from "@mdx-js/node-loader";

const cssLoader = {
  async load(url, context, defaultLoad) {
    if (url.endsWith(".css")) {
      return {
        format: "module",
        source: "",
      };
    } else {
      return defaultLoad(url, context, defaultLoad);
    }
  },
};

const mdxLoader = createLoader({
  fixRuntimeWithoutExportMap: false,
});

export default {
  loaders: [mdxLoader, cssLoader, tsNodeLoader],
};
