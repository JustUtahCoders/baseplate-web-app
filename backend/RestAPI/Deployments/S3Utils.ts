import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";

export function s3BucketName(envId: BaseplateUUID) {
  /*
   */
  const baseplateEnv = process.env.BASEPLATE_ENV === "dev" ? "dev" : "prod";
  const bucketName = `baseplate-${baseplateEnv}-static-web-${String(envId)}`;
  if (bucketName.length > 63) {
    throw Error(
      `s3BucketName(): generated s3 bucket name is longer than the s3 limit of 63 chars`
    );
  }

  return bucketName;
}
