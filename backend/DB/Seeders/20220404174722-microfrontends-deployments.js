"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    const [navbarMFE, settingsMFE] = await queryInterface.bulkInsert(
      "Microfrontends",
      [
        {
          customerOrgId: sampleCustomerOrgId,
          name: "navbar",
          scope: null,
          useCustomerOrgKeyAsScope: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "settings",
          scope: null,
          useCustomerOrgKeyAsScope: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: true,
      }
    );

    await queryInterface.bulkInsert("Deployments", [
      {
        microfrontendId: navbarMFE.id,
        userId: sampleUserId,
        foundryTokenId: null,
        cause: "foundryWebApp",
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        microfrontendId: settingsMFE.id,
        userId: sampleUserId,
        foundryTokenId: null,
        cause: "deploymentCLI",
        status: "failure",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        microfrontendId: settingsMFE.id,
        userId: sampleUserId,
        foundryTokenId: null,
        cause: "foundryWebApp",
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    /*
      Deleting the microfrontends automatically deletes the deployments,
      due to our foreign key cascade rules in the migration for mfes/deployments
    */
    await queryInterface.bulkDelete("Microfrontends", {
      customerOrgId: sampleCustomerOrgId,
      name: {
        [Sequelize.Op.in]: ["settings", "navbar"],
      },
    });
  },
};
