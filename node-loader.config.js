import * as tsNodeLoader from "ts-node/esm";

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

export default {
  loaders: [cssLoader, tsNodeLoader],
};
