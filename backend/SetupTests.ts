import { jest } from "@jest/globals";

// @ts-ignore
global.fetch = jest.fn();

process.env.CLOUDFLARE_ACCOUNT_ID = "1";
process.env.CLOUDFLARE_NAMESPACE_ID = "2";
process.env.CLOUDFLARE_AUTH_EMAIL = "3";
process.env.CLOUDFLARE_AUTH_KEY = "4";
