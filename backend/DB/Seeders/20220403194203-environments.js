"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");
const {
  S3Client,
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  DeleteBucketCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const dotEnv = require("dotenv");

dotEnv.config({
  path: ".env.dev",
});

let s3Client,
  seedRemoteServices = process.env.NODE_ENV !== "db-tests";
if (seedRemoteServices) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    const [prodEnv, stageEnv, devEnv] = await queryInterface.bulkInsert(
      "Environments",
      [
        {
          customerOrgId: sampleCustomerOrgId,
          name: "prod",
          isProd: true,
          pipelineOrder: 2,
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://INCORRECT_TEMP_BUCKET",
          auditAccountId: sampleUserId,
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "stage",
          isProd: false,
          pipelineOrder: 1,
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://INCORRECT_TEMP_BUCKET",
          auditAccountId: sampleUserId,
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "dev",
          isProd: false,
          pipelineOrder: 0,
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://INCORRECT_TEMP_BUCKET",
          auditAccountId: sampleUserId,
        },
      ],
      {
        returning: true,
      }
    );

    const devBucket = `baseplate-dev-static-web-${devEnv.id}`;
    const stageBucket = `baseplate-dev-static-web-${stageEnv.id}`;
    const prodBucket = `baseplate-dev-static-web-${prodEnv.id}`;

    await queryInterface.bulkUpdate(
      "Environments",
      {
        staticWebProxyHost: "s3://" + devBucket,
      },
      {
        id: devEnv.id,
      }
    );

    await queryInterface.bulkUpdate(
      "Environments",
      {
        staticWebProxyHost: "s3://" + stageBucket,
      },
      {
        id: stageEnv.id,
      }
    );
    await queryInterface.bulkUpdate(
      "Environments",
      {
        staticWebProxyHost: "s3://" + prodBucket,
      },
      {
        id: prodEnv.id,
      }
    );

    if (seedRemoteServices) {
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: devBucket,
          ObjectOwnership: "BucketOwnerEnforced",
        })
      );
      await s3Client.send(
        new PutPublicAccessBlockCommand({
          Bucket: devBucket,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
        })
      );

      await s3Client.send(
        new CreateBucketCommand({
          Bucket: stageBucket,
          ObjectOwnership: "BucketOwnerEnforced",
        })
      );
      await s3Client.send(
        new PutPublicAccessBlockCommand({
          Bucket: stageBucket,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
        })
      );

      await s3Client.send(
        new CreateBucketCommand({
          Bucket: prodBucket,
          ObjectOwnership: "BucketOwnerEnforced",
        })
      );
      await s3Client.send(
        new PutPublicAccessBlockCommand({
          Bucket: prodBucket,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
        })
      );

      let cloudflareKVResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/org-settings-${process.env.SEED_ORG_KEY}`,
        {
          method: "PUT",
          headers: {
            "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
            authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            cors: {
              allowCredentials: null,
              allowHeaders: null,
              allowMethods: null,
              allowOrigins: null,
              exposeHeaders: null,
              maxAge: null,
            },
            importMapCacheControl: null,
            orgExists: true,
            staticFiles: {
              cacheControl: null,
              microfrontendProxy: {
                environments: {
                  dev: {
                    environmentId: devEnv.id,
                    host: `s3://${devBucket}`,
                    useBaseplateHosting: true,
                  },
                  stage: {
                    environmentId: stageEnv.id,
                    host: `s3://${stageBucket}`,
                    useBaseplateHosting: true,
                  },
                  prod: {
                    environmentId: prodEnv.id,
                    host: `s3://${prodBucket}`,
                    useBaseplateHosting: true,
                  },
                },
              },
            },
          }),
        }
      );

      if (!cloudflareKVResponse.ok) {
        console.log(await cloudflareKVResponse.text());
        throw Error(
          `Writing org settings to Cloudflare KV failed with HTTP status ${r.status}`
        );
      }

      cloudflareKVResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/import-map-${process.env.SEED_ORG_KEY}-dev-systemjs`,
        {
          method: "PUT",
          headers: {
            "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
            authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            imports: {},
            scopes: {},
          }),
        }
      );

      if (!cloudflareKVResponse.ok) {
        console.log(await cloudflareKVResponse.text());
        throw Error(
          `Writing dev import map to Cloudflare KV failed with HTTP status ${r.status}`
        );
      }

      cloudflareKVResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/import-map-${process.env.SEED_ORG_KEY}-stage-systemjs`,
        {
          method: "PUT",
          headers: {
            "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
            authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            imports: {},
            scopes: {},
          }),
        }
      );

      if (!cloudflareKVResponse.ok) {
        console.log(await cloudflareKVResponse.text());
        throw Error(
          `Writing stage import map to Cloudflare KV failed with HTTP status ${r.status}`
        );
      }

      cloudflareKVResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/import-map-${process.env.SEED_ORG_KEY}-prod-systemjs`,
        {
          method: "PUT",
          headers: {
            "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
            authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            imports: {},
            scopes: {},
          }),
        }
      );

      if (!cloudflareKVResponse.ok) {
        console.log(await cloudflareKVResponse.text());
        throw Error(
          `Writing prod import map to Cloudflare KV failed with HTTP status ${r.status}`
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    if (seedRemoteServices) {
      const envs = await queryInterface.rawSelect(
        "Environments",
        {
          where: {
            customerOrgId: sampleCustomerOrgId,
          },
          plain: false,
        },
        ["id", "name"]
      );

      let cloudflareKVResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/org-settings-${process.env.SEED_ORG_KEY}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
            authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
          },
        }
      );

      if (!cloudflareKVResponse.ok) {
        console.log(await cloudflareKVResponse.text());
        throw Error(
          `Deleting org settings from Cloudflare KV failed with HTTP status ${r.status}`
        );
      }

      for (let env of envs) {
        const bucketName = `baseplate-dev-static-web-${env.id}`;
        const listObjectsRes = await s3Client.send(
          new ListObjectsCommand({
            Bucket: bucketName,
          })
        );
        if (listObjectsRes.Contents) {
          await s3Client.send(
            new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: listObjectsRes.Contents,
              },
            })
          );
        }
        await s3Client.send(
          new DeleteBucketCommand({
            Bucket: bucketName,
          })
        );

        cloudflareKVResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/import-map-${process.env.SEED_ORG_KEY}-${env.name}-systemjs`,
          {
            method: "DELETE",
            headers: {
              "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL,
              authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
            },
          }
        );

        if (!cloudflareKVResponse.ok) {
          console.log(await cloudflareKVResponse.text());
          throw Error(
            `Deleting org settings from Cloudflare KV failed with HTTP status ${r.status}`
          );
        }
      }
    }

    await queryInterface.bulkDelete("Environments", {
      customerOrgId: sampleCustomerOrgId,
    });
  },

  async getSampleEnvironment(queryInterface) {
    const [prodEnv] = await queryInterface.rawSelect(
      "Environments",
      {
        where: {
          name: "prod",
        },
        plain: false,
      },
      ["id"]
    );

    return {
      sampleEnvironmentId: prodEnv.id,
    };
  },
};
