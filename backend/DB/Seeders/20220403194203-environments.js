"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");

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
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://baseplate-static-web-hosting-prod",
          auditAccountId: sampleUserId,
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "stage",
          isProd: false,
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://baseplate-static-web-hosting-stage",
          auditAccountId: sampleUserId,
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "dev",
          isProd: false,
          useBaseplateStaticWebHosting: true,
          staticWebProxyHost: "s3://baseplate-static-web-hosting-dev",
          auditAccountId: sampleUserId,
        },
      ],
      {
        returning: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

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
