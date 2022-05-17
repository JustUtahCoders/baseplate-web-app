import { BaseplateAccount } from "./Utils/IAMUtils";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASEPLATE_ENV: string;
      CLOUDFLARE_ACCOUNT_ID: string;
      CLOUDFLARE_NAESPACE_ID: string;
      CLOUDFLARE_AUTH_EMAIL: string;
      CLOUDFLARE_AUTH_KEY: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      AWS_STS_ROLE: string;
      AWS_STS_REGION: string;
      AWS_STS_ACCESS_KEY_ID: string;
      AWS_STS_SECRET_ACCESS_KEY: string;
    }
  }

  namespace Express {
    export interface Request {
      baseplateAccount: BaseplateAccount;
    }
  }
}
