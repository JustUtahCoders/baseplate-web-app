"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable(
      "Microfrontends",
      (
        await import("../Models/Microfrontend/MicrofrontendSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "Microfrontends");

    await queryInterface.createTable(
      "Deployments",
      (
        await import("../Models/Deployment/DeploymentSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "Deployments");

    await queryInterface.createTable(
      "DeployedMicrofrontends",
      (
        await import(
          "../Models/DeployedMicrofrontend/DeployedMicrofrontendSchema.js"
        )
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "DeployedMicrofrontends");

    await queryInterface.createTable(
      "DeploymentLogs",
      (
        await import("../Models/DeploymentLog/DeploymentLogSchema.js")
      ).initialSchema
    );
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.dropTable("DeploymentLogs");

    await auditInit.dropAuditTable(queryInterface, "DeployedMicrofrontends");
    await queryInterface.dropTable("DeployedMicrofrontends");

    await auditInit.dropAuditTable(queryInterface, "Deployments");
    await queryInterface.dropTable("Deployments");

    await auditInit.dropAuditTable(queryInterface, "Microfrontends");
    await queryInterface.dropTable("Microfrontends");
  },
};
