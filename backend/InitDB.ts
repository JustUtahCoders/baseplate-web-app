import { router } from "./Router";
import { Sequelize } from "sequelize";
import dbConfigs from "./DB/Config/Config";
import EventEmitter from "events";

const env: string = process.env.NODE_ENV || "development";
const config = dbConfigs[env];

if (!config) {
  throw Error(`No db config found for NODE_ENV '${env}'`);
}

if (!config.database) {
  throw Error(
    `Invalid db config - no database set. This usually means an environment variable is not set.`
  );
}
if (!config.username) {
  throw Error(
    `Invalid db config - no username set. This usually means an environment variable is not set.`
  );
}
if (!config.password) {
  throw Error(
    `Invalid db config - no password set. This usually means an environment variable is not set.`
  );
}

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const modelEvents = new EventEmitter();

modelEvents.setMaxListeners(50);

export const dbReady = new Promise<void>((resolve, reject) => {
  let timeoutId;
  const intervalId = setInterval(() => {
    console.log("Attempting to connect to db");
    sequelize
      .authenticate()
      .then(async () => {
        console.log("Database connection established");
        clearInterval(intervalId);

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve();
      })
      .catch((err) => {
        console.error("Failed to connect to db. Trying again in 300ms");
        // console.error(err);
      });
  }, 300);

  if (["development", "db-tests"].includes(env)) {
    timeoutId = setTimeout(() => {
      console.log("Unable to connect to db. Giving up");
      process.exit(1);
    }, 10000);
  }
})
  .then(() => {
    let initPromises: Promise<any>[] = [];

    modelEvents.on("migration", (promise: Promise<any>) => {
      initPromises.push(promise);
    });

    // Tell all models to init and associate with other models. This can't be done synchronously
    // in the model files because of order-of-execution edge cases.
    // See https://sequelize.org/master/class/lib/associations/base.js~Association.html
    modelEvents.emit("init", sequelize);

    modelEvents.emit("associate", sequelize);

    return Promise.all(initPromises);
  })
  .then(() => {
    console.log("DB fully initialized");
    // Used for the custom logger to know when to start logging
    modelEvents.emit("start", sequelize);
  });

router.use(async (req, res, next) => {
  await dbReady;
  next();
});
