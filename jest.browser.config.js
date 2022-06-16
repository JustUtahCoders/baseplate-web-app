/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testPathIgnorePatterns: ["<rootDir>/backend"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/__mocks__/CSSStub.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/frontend/SetupTests.tsx"],
};

export default config;
