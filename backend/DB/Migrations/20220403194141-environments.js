"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable(
      "Environments",
      (
        await import("../Models/Environment/EnvironmentSchema.js")
      ).initialSchema,
      {
        uniqueKeys: {
          uniquePipelineOrder: {
            fields: ["pipelineOrder", "customerOrgId"],
          },
        },
      }
    );
    await auditInit.createAuditTable(queryInterface, "Environments");
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await auditInit.dropAuditTable(queryInterface, "Environments");
    await queryInterface.dropTable("Environments");
  },
};
