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

    const orgOwnerPerms = await queryInterface.sequelize.query(
      `
      SELECT "RolePermissions"."permissionId", "Permissions"."requiresEntityId"
      FROM "RolePermissions"
      JOIN "Permissions" ON "RolePermissions"."permissionId" = "Permissions"."id"
      WHERE "RolePermissions"."roleId" = '${orgOwnerRoleId}'
    `.trim(),
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const mfeOwnerPerms = await queryInterface.sequelize.query(
      `
      SELECT "RolePermissions"."permissionId", "Permissions"."requiresEntityId"
      FROM "RolePermissions"
      JOIN "Permissions" ON "RolePermissions"."permissionId" = "Permissions"."id"
      WHERE "RolePermissions"."roleId" = '${mfeOwnerRoleId}'
    `.trim(),
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const devPerms = await queryInterface.sequelize.query(
      `
      SELECT "RolePermissions"."permissionId", "Permissions"."requiresEntityId"
      FROM "RolePermissions"
      JOIN "Permissions" ON "RolePermissions"."permissionId" = "Permissions"."id"
      WHERE "RolePermissions"."roleId" = '${devRoleId}'
    `.trim(),
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const microfrontends = await queryInterface.rawSelect(
      "Microfrontends",
      {
        where: {
          customerOrgId: sampleCustomerOrgId,
        },
        plain: false,
      },
      ["id"]
    );

    const permissionsToAccountPermissions = (permissions, accountId) => {
      return permissions.reduce((acc, permission) => {
        if (permission.requiresEntityId) {
          acc.push(
            ...microfrontends.map((microfrontendId) => ({
              customerOrgId: sampleCustomerOrgId,
              accountId,
              permissionId: permission.permissionId,
              entityId: microfrontendId.id,
              auditAccountId: baseplateWebAppToken,
            }))
          );
        } else {
          acc.push({
            customerOrgId: sampleCustomerOrgId,
            accountId,
            permissionId: permission.permissionId,
            auditAccountId: baseplateWebAppToken,
          });
        }

        return acc;
      }, []);
    };

    const allAccountPerms = permissionsToAccountPermissions(
      orgOwnerPerms,
      sampleUserId
    )
      .concat(permissionsToAccountPermissions(mfeOwnerPerms, mfeOwnerUserId))
      .concat(permissionsToAccountPermissions(devPerms, devUserId));

    console.log("allAccountPerms", allAccountPerms);

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

    await queryInterface.bulkInsert("AccountPermissions", tokenPermissions);
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
