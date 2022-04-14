"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const environmentInit = await import("../Models/EnvironmentInit.js");
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable("Environments", environmentInit.default);
    await auditInit.createAuditTable(queryInterface, "Environments");
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await auditInit.dropAuditTable(queryInterface, "Environments");
    await queryInterface.dropTable("Environments");
  },
};
