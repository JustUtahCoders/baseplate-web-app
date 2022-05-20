import { BaseplateAccount } from "./Utils/IAMUtils";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASEPLATE_ENV: "dev" | "prod";
      BASEPLATE_CDN: string;
      CLOUDFLARE_ACCOUNT_ID: string;
      CLOUDFLARE_NAESPACE_ID: string;
      CLOUDFLARE_AUTH_EMAIL: string;
      CLOUDFLARE_AUTH_KEY: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      AWS_STS_ROLE: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
    }
  }

  namespace Express {
    export interface Request {
      baseplateAccount: BaseplateAccount;
    }
  }
}
