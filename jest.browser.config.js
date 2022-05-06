/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  // testMatch: [
  //   "**/?(*.)+(spec|test).[jt]s?(x)"
  // ],
  testRegex: "\\.test\\.[jt]sx?$",
  testPathIgnorePatterns: ["<rootDir>/backend"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};

export default config;
