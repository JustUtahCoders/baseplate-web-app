declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUDFLARE_ACCOUNT_ID: string;
      CLOUDFLARE_NAESPACE_ID: string;
      CLOUDFLARE_AUTH_EMAIL: string;
      CLOUDFLARE_AUTH_KEY: string;
    }
  }
}

export {};
