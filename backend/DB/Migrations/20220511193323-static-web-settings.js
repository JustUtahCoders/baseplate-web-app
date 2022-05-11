"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable(
      "StaticWebSettings",
      (
        await import("../Models/CustomerOrg/StaticWebSettingsSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "StaticWebSettings");
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await auditInit.dropAuditTable(queryInterface, "StaticWebSettings");
    await queryInterface.dropTable("StaticWebSettings");
  },
};
