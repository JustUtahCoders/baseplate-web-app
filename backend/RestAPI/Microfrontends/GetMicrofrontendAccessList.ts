import { param } from "express-validator";
import sequelize from "sequelize";
import { AccountPermissionModel } from "../../DB/Models/IAM/AccountPermission";
import {
  BaseplatePermission,
  PermissionModel,
} from "../../DB/Models/IAM/Permission";
import { ModelWithIncludes } from "../../DB/Models/SequelizeTSHelpers";
import { ShareableUserAttributes, UserModel } from "../../DB/Models/User/User";
import { router } from "../../Router";
import {
  serverApiError,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithMicrofrontendId } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";

router.get<
  RouteParamsWithMicrofrontendId,
  EndpointGetMicrofrontendAccessResBody
>(
  `/api/orgs/:customerOrgId/microfrontends/:microfrontendId/access`,

  // Validation
  param("customerOrgId").isUUID(),
  param("microfrontendId").isUUID(),
  validationResponseMiddleware,

  // Permissions
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendAccess,
    });
  },

  // Implementation
  async (req, res) => {
    const permissions = await PermissionModel.findAll({
      where: {
        [sequelize.Op.or]: [
          {
            name: BaseplatePermission.ManageAllMicrofrontendSettings,
          },
          {
            name: BaseplatePermission.DeployOneMicrofrontend,
          },
          {
            name: BaseplatePermission.ManageOneMicrofrontendOwner,
          },
        ],
      },
    });

    const manageAllMFEUsersPermission = permissions.find(
      (p) => p.name === BaseplatePermission.ManageAllMicrofrontendSettings
    )!;
    const deployOneMFEPermission = permissions.find(
      (p) => p.name === BaseplatePermission.DeployOneMicrofrontend
    )!;
    const manageOneMFEOwnerPermission = permissions.find(
      (p) => p.name === BaseplatePermission.ManageOneMicrofrontendOwner
    )!;

    const includeUser = {
      model: UserModel,
      as: "user",
      foreignKey: "accountId",
      required: false,
    };

    const [allMicrofrontendsAccountPermissions, thisMicrofrontendPermissions] =
      await Promise.all([
        AccountPermissionModel.findAll({
          where: {
            customerOrgId: req.params.customerOrgId,
            permissionId: manageAllMFEUsersPermission.id,
          },
          include: [includeUser],
        }) as unknown as ModelWithIncludes<
          AccountPermissionModel,
          { user: UserModel }
        >[],

        AccountPermissionModel.findAll({
          where: {
            customerOrgId: req.params.customerOrgId,
            [sequelize.Op.or]: [
              {
                permissionId: manageOneMFEOwnerPermission.id,
              },
              {
                permissionId: deployOneMFEPermission.id,
              },
            ],
            entityId: req.params.microfrontendId,
          },
          include: [includeUser],
        }) as unknown as ModelWithIncludes<
          AccountPermissionModel,
          { user: UserModel }
        >[],
      ]);

    const ownerAP = thisMicrofrontendPermissions.find(
      (ap) => ap.permissionId === manageOneMFEOwnerPermission.id
    );

    if (!ownerAP) {
      return serverApiError(res, "No owner found for this microfrontend");
    }

    res.json({
      accessList: [],
    });
  }
);

export interface EndpointGetMicrofrontendAccessResBody {
  accessList: EntityWithAccess[];
}

export enum EntityType {
  user = "user",
  personalAccessToken = "personalAccessToken",
  serviceAccountToken = "serviceAccountToken",
}

export enum EntityAccess {
  collaborator = "collaborator",
  owner = "owner",
  admin = "admin",
}

export type EntityWithAccess =
  | UserWithAccess
  | PersonalAccessTokenWithAccess
  | ServiceAccountTokenWithAccess;

export interface UserWithAccess {
  entityType: EntityType.user;
  user: ShareableUserAttributes;
  access: EntityAccess;
}

export interface PersonalAccessTokenWithAccess {
  entityType: EntityType.personalAccessToken;
  user: ShareableUserAttributes;
  access: EntityAccess;
  lastUsed: Date | null;
}

export interface ServiceAccountTokenWithAccess {
  entityType: EntityType.serviceAccountToken;
  name: string;
  access: EntityAccess;
  lastUsed: Date | null;
}
