"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId, mfeOwnerUserId, devUserId } =
      await getSampleUserAndCustomerOrg(queryInterface);
    const baseplateWebAppToken = await queryInterface.rawSelect(
      "AuthTokens",
      {
        where: {
          authTokenType: "webAppCodeAccess",
        },
      },
      ["id"]
    );

    const orgOwnerRoleId = await queryInterface.rawSelect(
      "Roles",
      {
        where: {
          name: "customerOrgs.owner",
        },
      },
      ["id"]
    );

    const mfeOwnerRoleId = await queryInterface.rawSelect(
      "Roles",
      {
        where: {
          name: "microfrontend.owner",
        },
      },
      ["id"]
    );

    const devRoleId = await queryInterface.rawSelect(
      "Roles",
      {
        where: {
          name: "developer",
        },
      },
      ["id"]
    );

    await queryInterface.bulkInsert("AccountRoles", [
      {
        customerOrgId: sampleCustomerOrgId,
        accountId: sampleUserId,
        roleId: orgOwnerRoleId,
        auditAccountId: baseplateWebAppToken,
      },
      {
        customerOrgId: sampleCustomerOrgId,
        accountId: mfeOwnerUserId,
        roleId: mfeOwnerRoleId,
        auditAccountId: baseplateWebAppToken,
      },
      {
        customerOrgId: sampleCustomerOrgId,
        accountId: devUserId,
        roleId: devRoleId,
        auditAccountId: baseplateWebAppToken,
      },
    ]);

    const orgOwnerPerms = await queryInterface.rawSelect(
      "RolePermissions",
      {
        where: {
          roleId: orgOwnerRoleId,
        },
        // https://stackoverflow.com/a/68160787/1958941
        plain: false,
      },
      ["id"]
    );

    const mfeOwnerPerms = await queryInterface.rawSelect(
      "RolePermissions",
      {
        where: {
          roleId: mfeOwnerRoleId,
        },
        // https://stackoverflow.com/a/68160787/1958941
        plain: false,
      },
      ["id"]
    );

    const devPerms = await queryInterface.rawSelect(
      "RolePermissions",
      {
        where: {
          roleId: devRoleId,
        },
        // https://stackoverflow.com/a/68160787/1958941
        plain: false,
      },
      ["id"]
    );

    const allAccountPerms = orgOwnerPerms
      .map((p) => ({
        customerOrgId: sampleCustomerOrgId,
        accountId: sampleUserId,
        permissionId: p.permissionId,
        auditAccountId: baseplateWebAppToken,
      }))
      .concat(
        mfeOwnerPerms.map((p) => ({
          customerOrgId: sampleCustomerOrgId,
          accountId: mfeOwnerUserId,
          permissionId: p.permissionId,
          auditAccountId: baseplateWebAppToken,
        }))
      )
      .concat(
        devPerms.map((p) => ({
          customerOrgId: sampleCustomerOrgId,
          accountId: devUserId,
          permissionId: p.permissionId,
          auditAccountId: baseplateWebAppToken,
        }))
      );

    await queryInterface.bulkInsert("AccountPermissions", allAccountPerms);

    const [baseplateApiToken] = await queryInterface.bulkInsert(
      "AuthTokens",
      [
        {
          userId: sampleUserId,
          customerOrgId: sampleCustomerOrgId,
          authTokenType: "baseplateApiToken",
        },
      ],
      {
        returning: true,
      }
    );

    const tokenPermissions = orgOwnerPerms.map((p) => ({
      customerOrgId: sampleCustomerOrgId,
      accountId: baseplateApiToken.id,
      permissionId: p.permissionId,
      auditAccountId: baseplateWebAppToken,
    }));

    await queryInterface.bulkInsert("AccountPermissions", allAccountPerms);
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);
    const orgOwnerRoleId = await queryInterface.rawSelect(
      "Roles",
      {
        where: {
          name: "customerOrgs.owner",
        },
      },
      ["id"]
    );

    await queryInterface.bulkDelete("AccountRoles", {
      roleId: orgOwnerRoleId,
      accountId: sampleUserId,
    });

    await queryInterface.bulkDelete("AccountPermissions", {
      accountId: sampleUserId,
    });
  },
};
