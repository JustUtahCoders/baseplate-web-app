/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "lodash-es": "lodash",
  },
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
