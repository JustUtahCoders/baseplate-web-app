import { Options } from "sequelize";
import { modelEvents } from "../../DB";

const allConfigs: AllDBConfigs = {
  development: {
    username: "root",
    password: "password",
    database: "foundry",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: skipDBMigrationLogger,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
};

export default allConfigs;

let dbInit = false;

function skipDBMigrationLogger(sql: string, timing?: number): void {
  if (dbInit) {
    console.log(sql);
  }
}

// Promise.resolve() to give DB.ts a chance to instantiate
// This is to work around circular dependency issues where
// config.ts and DB.ts import each other and so we can't
// guarantee that DB.ts has instantiated before config.ts
Promise.resolve().then(() => {
  modelEvents.once("start", () => {
    dbInit = true;
  });
});

interface AllDBConfigs {
  [key: string]: Options;
}
