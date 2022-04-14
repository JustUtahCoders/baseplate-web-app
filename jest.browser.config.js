/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "lodash-es": "lodash",
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};

export default config;
