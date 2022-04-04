"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Microfrontends", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customerOrgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "CustomerOrgs",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      scope: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      useCustomerOrgKeyAsScope: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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

    await queryInterface.createTable("Deployments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      microfrontendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Microfrontends",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      foundryTokenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "JWTs",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      cause: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Deployments");
    await queryInterface.dropTable("Microfrontends");
  },
};
