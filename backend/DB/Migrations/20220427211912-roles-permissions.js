"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    const baseplateWebAppToken = await queryInterface.rawSelect(
      "AuthTokens",
      {
        where: {
          authTokenType: "webAppCodeAccess",
        },
      },
      ["id"]
    );

    await queryInterface.createTable(
      "Permissions",
      (
        await import("../Models/IAM/PermissionSchema.js")
      ).initialSchema
    );
    await queryInterface.createTable(
      "AccountPermissions",
      (
        await import("../Models/IAM/AccountPermissionSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "AccountPermissions");
    await queryInterface.createTable(
      "Roles",
      (
        await import("../Models/IAM/RoleSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "Roles");
    await queryInterface.createTable(
      "RolePermissions",
      (
        await import("../Models/IAM/RolePermissionSchema.js")
      ).initialSchema
    );
    await queryInterface.createTable(
      "AccountRoles",
      (
        await import("../Models/IAM/AccountRoleSchema.js")
      ).initialSchema
    );
    await auditInit.createAuditTable(queryInterface, "AccountRoles");

    // Permissions and roles are created here in a migration rather than a seeder because this is the
    // way they're created in the live, deployed environments.
    const permissions = await queryInterface.bulkInsert(
      "Permissions",
      [
        {
          name: "customerOrgs.settings.view",
          humanReadableName: "View organization settings",
          description:
            "View your organization's slug, cors settings, and other settings",
          requiresEntityId: false,
        },
        {
          name: "customerOrgs.settings.manage",
          humanReadableName: "Manage organization settings",
          description:
            "Manage your organization's slug, cors settings, and other settings",
          requiresEntityId: false,
        },
        {
          name: "customerOrgs.billing.view",
          humanReadableName: "View organization billing information",
          description:
            "View your organization's payment method, statements, payment history, and invoices.",
          requiresEntityId: false,
        },
        {
          name: "customerOrgs.access.view",
          humanReadableName: "View organization access",
          description:
            "View your organization's users and service account tokens, including their permissions and roles.",
          requiresEntityId: false,
        },
        {
          name: "customerOrgs.users.manage",
          humanReadableName: "Manage organization access",
          description:
            "Manage your organization's users, including their permissions and roles. Invite new users or deactivate existing users.",
          requiresEntityId: false,
        },
        {
          name: "customerOrgs.owner.manage",
          humanReadableName: "Manage organization owner",
          description:
            "Give organization ownership to a different user. Note that only one user can be owner of an organization at any one time.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.owner.manage",
          humanReadableName: "Manage all microfrontend owners",
          description: "Manage which users own which microfrontends.",
          requiresEntityId: true,
        },
        {
          name: "allMicrofrontends.deployments.trigger",
          humanReadableName: "Trigger deployment for all microfrontends",
          description: "Deploy and rollback any microfrontend.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.deployments.view",
          humanReadableName: "View deployments for all microfrontends",
          description:
            "View all deployment and rollback history for every microfrontend.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.access.view",
          humanReadableName: "View access for all microfrontends",
          description:
            "View which users and service account tokens have access to a microfrontend, and which users own a microfrontend.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.access.manage",
          humanReadableName: "Manage access for all microfrontends",
          description:
            "Manage which users and service account tokens own or have access to your organization's microfrontends.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.create",
          humanReadableName: "Create microfrontend",
          description: "Create a new microrontend, making yourself owner.",
          requiresEntityId: false,
        },
        {
          name: "allMicrofrontends.settings.manage",
          humanReadableName: "Manage settings for all microfrontends",
          description:
            "Rename and update any other settings for all microfrontends",
          requiresEntityId: false,
        },
        {
          name: "microfrontend.owner.manage",
          humanReadableName: "Manage a specific microfrontend's owner",
          description: "Change which users own a specific microfrontend.",
          requiresEntityId: true,
        },
        {
          name: "microfrontend.deployments.trigger",
          humanReadableName: "Deploy a specific microfrontend",
          description:
            "Deploy a specific microfrontend to a new version, or rollback to a previous version",
          requiresEntityId: true,
        },
        {
          name: "microfrontend.access.manage",
          humanReadableName:
            "Manage a specific microfrontend's users and service account tokens",
          description:
            "Manage which users and service account tokens have access to deploy a microfrontend.",
          requiresEntityId: true,
        },
        {
          name: "microfrontend.settings.manage",
          humanReadableName: "Manage a specific microfrontend's settings",
          description:
            "Rename and update any other settings for a specific microfrontend",
          requiresEntityId: true,
        },
        {
          name: "allEnvironments.view",
          humanReadableName: "View all environments",
          description: "View all code environments that can be deployed to",
          requiresEntityId: false,
        },
        {
          name: "allEnvironments.manage",
          humanReadableName: "Manage all environments",
          description: "Rename, create, or delete code environments.",
          requiresEntityId: false,
        },
      ],
      {
        returning: true,
      }
    );

    const [
      viewOrgSettingsPerm,
      manageOrgSettingsPerm,
      viewOrgBillingPerm,
      viewOrgAccessPerm,
      manageOrgAccessPerm,
      manageOrgOwnerPerm,
      manageAllMFEOwnersPerm,
      triggerAllMFEDeployments,
      viewAllMFEDeployments,
      viewAllMFEAccess,
      manageAllMFEAccess,
      createMFEPerm,
      manageAllMFESettingsPerm,
      manageMFEOwnerPerm,
      triggerMFEDeploymentPerm,
      manageMFEAccessPerm,
      manageMFESettingsPerm,
      viewEnvironmentsPerm,
      manageEnvironmentsPerm,
    ] = permissions;

    const [orgOwnerRole, mfeOwnerRole, devRole] =
      await queryInterface.bulkInsert(
        "Roles",
        [
          {
            name: "customerOrgs.owner",
            humanReadableName: "Organization Owner",
            description: "Full access to everything within the organization",
            requiresEntityId: false,
            deprecationDate: null,
            auditAccountId: baseplateWebAppToken,
          },
          {
            name: "microfrontend.owner",
            humanReadableName: "Microfrontend Owner",
            description:
              "View everything, and fully manage users, deployments, and access to a specific microfrontend.",
            requiresEntityId: true,
            deprecationDate: null,
            auditAccountId: baseplateWebAppToken,
          },
          {
            name: "developer",
            humanReadableName: "Software developer",
            description:
              "View everything, create microfrontends, and deploy microfrontends you have access to.",
            requiresEntityId: false,
            deprecationDate: null,
            auditAccountId: baseplateWebAppToken,
          },
        ],
        {
          returning: true,
        }
      );

    const devPerms = [
      viewAllMFEDeployments,
      viewAllMFEAccess,
      viewEnvironmentsPerm,
      viewOrgAccessPerm,
      createMFEPerm,
      viewOrgSettingsPerm,
    ];

    const mfeOwnerPerms = devPerms.concat([
      manageMFEOwnerPerm,
      triggerMFEDeploymentPerm,
      manageMFEAccessPerm,
      manageMFESettingsPerm,
    ]);

    const orgOwnerPerms = [
      viewOrgSettingsPerm,
      manageOrgSettingsPerm,
      viewOrgBillingPerm,
      viewOrgAccessPerm,
      manageOrgAccessPerm,
      manageOrgOwnerPerm,
      manageAllMFEOwnersPerm,
      triggerAllMFEDeployments,
      viewAllMFEDeployments,
      viewAllMFEAccess,
      manageAllMFEAccess,
      createMFEPerm,
      manageAllMFESettingsPerm,
      viewEnvironmentsPerm,
      manageEnvironmentsPerm,
    ];

    const rolePermissionsToInsert = devPerms
      .map((p) => ({
        permissionId: p.id,
        roleId: devRole.id,
      }))
      .concat(
        mfeOwnerPerms.map((p) => ({
          permissionId: p.id,
          roleId: mfeOwnerRole.id,
        }))
      )
      .concat(
        orgOwnerPerms.map((p) => ({
          permissionId: p.id,
          roleId: orgOwnerRole.id,
        }))
      );

    await queryInterface.bulkInsert("RolePermissions", rolePermissionsToInsert);
  },

  async down(queryInterface, Sequelize) {
    const auditInit = await import("../Models/Audit/AuditInit.js");

    await auditInit.dropAuditTable(queryInterface, "AccountRoles");
    await queryInterface.dropTable("AccountRoles");
    await queryInterface.dropTable("RolePermissions");
    await auditInit.dropAuditTable(queryInterface, "Roles");
    await queryInterface.dropTable("Roles");
    await auditInit.dropAuditTable(queryInterface, "AccountPermissions");
    await queryInterface.dropTable("AccountPermissions");
    await queryInterface.dropTable("Permissions");
  },
};
