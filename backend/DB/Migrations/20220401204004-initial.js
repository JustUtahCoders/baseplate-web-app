"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
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
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable(
      "AuthTokens",
      (
        await import("../Models/AuthToken/AuthTokenSchema.js")
      ).initialSchema
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AuthTokens");
    await queryInterface.dropTable("UserCustomerOrgs");
    await queryInterface.dropTable("CustomerOrgs");
    await queryInterface.dropTable("Users");
  },
};
