import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

global.IN_WEBPACK = true;

// @ts-ignore
global.require = {
  // @ts-ignore
  context: jest.fn(),
};
