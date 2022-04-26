/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};

export default config;
