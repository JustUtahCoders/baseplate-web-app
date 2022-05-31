/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test-db|spec-db))\\.[jt]sx?$",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^.+\\.css$": "<rootDir>/__mocks__/CSSStub.ts",
  },
  setupFiles: ["<rootDir>/backend/SetupTests.ts"],
};

export default config;
