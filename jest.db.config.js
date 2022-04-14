/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "lodash-es": "lodash",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test-db|spec-db))\\.[jt]sx?$",
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
