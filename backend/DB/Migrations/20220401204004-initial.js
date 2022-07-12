"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await queryInterface.createTable(
      "Users",
      (
        await import("../Models/User/UserSchema.js")
      ).initialSchema
    );

    await queryInterface.createTable(
      "CustomerOrgs",
      (
        await import("../Models/CustomerOrg/CustomerOrgSchema.js")
      ).initialSchema
    );

    await queryInterface.createTable("UserCustomerOrgs", {
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      customerOrgId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "CustomerOrgs",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable(
      "AuthTokens",
      (
        await import("../Models/AuthToken/AuthTokenSchema.js")
      ).initialSchema
    );
    await queryInterface.addIndex("AuthTokens", ["secretAccessKey"]);

    await queryInterface.bulkInsert("AuthTokens", [
      {
        userId: null,
        customerOrgId: null,
        authTokenType: "webAppCodeAccess",
        // Need a UUID not connected to anything to create this
        auditAccountId: "8392cd4f-c21b-47d2-a4ed-c263239051a6",
      },
    ]);
    await auditInit.createAuditTable(queryInterface, "AuthTokens");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AuthTokens");
    await queryInterface.dropTable("UserCustomerOrgs");
    await queryInterface.dropTable("CustomerOrgs");
    await queryInterface.dropTable("Users");
  },
};
