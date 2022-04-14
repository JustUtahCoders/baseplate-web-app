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

    const [dep1, dep2, dep3] = await queryInterface.bulkInsert(
      "Deployments",
      [
        {
          microfrontendId: navbarMFE.id,
          userId: sampleUserId,
          baseplateTokenId: null,
          cause: "baseplateWebApp",
          status: "success",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          microfrontendId: settingsMFE.id,
          userId: sampleUserId,
          baseplateTokenId: null,
          cause: "deploymentCLI",
          status: "failure",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          microfrontendId: settingsMFE.id,
          userId: sampleUserId,
          baseplateTokenId: null,
          cause: "baseplateWebApp",
          status: "success",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: true,
      }
    );

    await queryInterface.bulkInsert("DeploymentLogs", [
      {
        deploymentId: dep1.id,
        label: "Upload Static Files",
        text: `
          Uploading navbar.js to s3
          Uploading navbar.css to s3
        `.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deploymentId: dep1.id,
        label: "Update Import Map",
        text: `
          Updating navbar in import map.
          Import Map update complete.
        `.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deploymentId: dep2.id,
        label: "Upload Static Files",
        text: `
          Uploading navbar.js to s3
          Error communicating with s3. Check credentials.
        `.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deploymentId: dep3.id,
        label: "Upload Static Files",
        text: `
          Uploading settings.js to s3
          Uploading settings.css to s3
        `.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deploymentId: dep3.id,
        label: "Update Import Map",
        text: `
          Updating settings in import map
          Import Map update complete.
        `.trim(),
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
