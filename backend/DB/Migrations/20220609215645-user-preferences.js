"use strict";

const tableName = "UserPreferences";

module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable(
      tableName,
      (
        await import("../Models/User/UserPreferencesSchema.js")
      ).initialSchema
    );

    await auditInit.createAuditTable(queryInterface, tableName);
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await auditInit.dropAuditTable(queryInterface, tableName);
    await queryInterface.dropTable(tableName);
  },
};
