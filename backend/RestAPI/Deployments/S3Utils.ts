import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";

export function s3BucketName(envId: BaseplateUUID) {
  /*
   * When BASEPLATE_ENV is dev, it's a fully internal environment, but it
   * still uses the same AWS account.
   *
   * BASEPLATE_ENV won't ever be `test` for baseplate-web-app since we will
   * let a single prod instance of the server manage both test and production environments.
   */
  const baseplateEnv = process.env.BASEPLATE_ENV === "dev" ? "dev" : "prod";

  const bucketName = `baseplate-${baseplateEnv}-static-web-${String(envId)}`;

  if (bucketName.length > 63) {
    throw Error(
      `s3BucketName(): generated s3 bucket name is longer than the s3 limit of 63 chars for env ${envId}`
    );
  }

  return bucketName;
}
