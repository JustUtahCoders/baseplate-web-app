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
          name: "__main__",
          isProd: true,
          auditUserId: sampleUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "stage",
          isProd: false,
          auditUserId: sampleUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "dev",
          isProd: false,
          auditUserId: sampleUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          name: "__main__",
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
