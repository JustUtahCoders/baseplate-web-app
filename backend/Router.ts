import dotenv from "dotenv";
import { Router as ExpressRouter } from "express";
import Router from "express-promise-router";

export const router: ExpressRouter = Router();

if (process.env.IS_RUNNING_LOCALLY) {
  dotenv.config({
    path: process.env.BASEPLATE_ENV
      ? `.env.${process.env.BASEPLATE_ENV}`
      : `.env.prod`,
  });
}

if (!["db-tests"].includes(process.env.NODE_ENV || "production")) {
  const requiredEnvVars: string[] = [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_NAMESPACE_ID",
    "CLOUDFLARE_AUTH_EMAIL",
    "CLOUDFLARE_AUTH_KEY",
  ];

  requiredEnvVars.forEach((envVarName) => {
    if (!process.env[envVarName]) {
      throw Error(
        `Required environment variable '${envVarName}' is not present.`
      );
    }
  });
}
