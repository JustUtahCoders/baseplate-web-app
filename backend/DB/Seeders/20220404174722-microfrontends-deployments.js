"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");
const { getSampleEnvironment } = require("./20220403194203-environments");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    const { sampleEnvironmentId } = await getSampleEnvironment(queryInterface);

    const [navbarMFE, settingsMFE] = await queryInterface.bulkInsert(
      "Microfrontends",
      [
        {
          customerOrgId: sampleCustomerOrgId,
          name: "navbar",
          scope: null,
          useCustomerOrgKeyAsScope: true,
          auditAccountId: sampleUserId,
        },
        {
          customerOrgId: sampleCustomerOrgId,
          name: "settings",
          scope: null,
          useCustomerOrgKeyAsScope: true,
          auditAccountId: sampleUserId,
        },
      ],
      {
        returning: true,
      }
    );

    const [dep1, dep2] = await queryInterface.bulkInsert(
      "Deployments",
      [
        {
          accountId: sampleUserId,
          cause: "baseplateWebApp",
          status: "success",
          environmentId: sampleEnvironmentId,
          auditAccountId: sampleUserId,
        },
        {
          accountId: sampleUserId,
          cause: "deploymentCLI",
          status: "failure",
          environmentId: sampleEnvironmentId,
          auditAccountId: sampleUserId,
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
      },
      {
        deploymentId: dep1.id,
        label: "Update Import Map",
        text: `
          Updating navbar in import map.
          Import Map update complete.
        `.trim(),
      },
      {
        deploymentId: dep2.id,
        label: "Upload Static Files",
        text: `
          Uploading navbar.js to s3
          Error communicating with s3. Check credentials.
        `.trim(),
      },
    ]);

    await queryInterface.bulkInsert("DeployedMicrofrontends", [
      {
        deploymentId: dep1.id,
        microfrontendId: navbarMFE.id,
        deploymentChangedMicrofrontend: true,
        bareImportSpecifier: "@convex/navbar",
        entryUrl: "https://cdn.baseplate.cloud/convex/navbar/navbar.v1.js",
        trailingSlashUrl: "https://cdn.baseplate.cloud/convex/navbar/",
        auditAccountId: sampleUserId,
      },
      {
        deploymentId: dep1.id,
        microfrontendId: settingsMFE.id,
        deploymentChangedMicrofrontend: true,
        bareImportSpecifier: "@convex/settings",
        entryUrl: "https://cdn.baseplate.cloud/convex/settings/settings.v1.js",
        trailingSlashUrl: "https://cdn.baseplate.cloud/convex/settings/",
        auditAccountId: sampleUserId,
      },
      {
        deploymentId: dep1.id,
        microfrontendId: navbarMFE.id,
        deploymentChangedMicrofrontend: true,
        bareImportSpecifier: "@convex/navbar",
        entryUrl: "https://cdn.baseplate.cloud/convex/navbar/navbar.v2.js",
        trailingSlashUrl: "https://cdn.baseplate.cloud/convex/navbar/",
        auditAccountId: sampleUserId,
      },
      {
        deploymentId: dep1.id,
        microfrontendId: settingsMFE.id,
        deploymentChangedMicrofrontend: false,
        bareImportSpecifier: "@convex/settings",
        entryUrl: "https://cdn.baseplate.cloud/convex/settings/settings.v1.js",
        trailingSlashUrl: "https://cdn.baseplate.cloud/convex/settings/",
        auditAccountId: sampleUserId,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    await queryInterface.bulkDelete("Microfrontends", {
      customerOrgId: sampleCustomerOrgId,
      name: {
        [Sequelize.Op.in]: ["settings", "navbar"],
      },
    });

    await queryInterface.bulkDelete("Deployments", {});
  },
};
