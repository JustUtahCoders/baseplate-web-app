import { param } from "express-validator";
import sequelize from "sequelize";
import {
  AuthTokenModel,
  AuthTokenType,
} from "../../DB/Models/AuthToken/AuthToken";
import { AccountPermissionModel } from "../../DB/Models/IAM/AccountPermission";
import {
  BaseplatePermission,
  Permission,
  PermissionModel,
} from "../../DB/Models/IAM/Permission";
import {
  BaseplateUUID,
  ModelWithIncludes,
} from "../../DB/Models/SequelizeTSHelpers";
import {
  ShareableUserAttributes,
  UserModel,
  userToShareableAttributes,
} from "../../DB/Models/User/User";
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

    const accountPermissions = (await AccountPermissionModel.findAll({
      where: {
        customerOrgId: req.params.customerOrgId,
        [sequelize.Op.or]: [
          {
            permissionId: manageOneMFEOwnerPermission.id,
            entityId: req.params.microfrontendId,
          },
          {
            permissionId: deployOneMFEPermission.id,
            entityId: req.params.microfrontendId,
          },
          {
            permissionId: manageAllMFEUsersPermission.id,
          },
        ],
      },
      include: [
        {
          model: PermissionModel,
          as: "permission",
          required: true,
        },
        {
          model: UserModel,
          as: "user",
          foreignKey: "accountId",
          required: false,
          include: [
            {
              model: AuthTokenModel,
              as: "authTokens",
              where: {
                authTokenType: AuthTokenType.personalAccessToken,
              },
              required: false,
            },
          ],
        },
        {
          model: AuthTokenModel,
          as: "authToken",
          foreignKey: "accountId",
          required: false,
        },
      ],
    })) as unknown as ModelWithIncludes<
      AccountPermissionModel,
      {
        user?: ModelWithIncludes<UserModel, { authTokens?: AuthTokenModel[] }>;
        authToken?: AuthTokenModel;
        permission: PermissionModel;
      }
    >[];

    const accessListMap: Record<BaseplateUUID, EntityWithAccess> = {};

    const addPermission = (
      permission: Permission,
      newEntry: EntityWithAccess
    ): EntityWithAccess => {
      let entry: EntityWithAccess = accessListMap[newEntry.id];

      if (!entry) {
        entry = accessListMap[newEntry.id] = newEntry;
      }

      if (!entry.permissions.some((p) => p.id === permission.id)) {
        entry.permissions.push(permission);
      }

      return entry;
    };

    for (let accountPermission of accountPermissions) {
      if (
        accountPermission.authToken?.authTokenType ===
        AuthTokenType.serviceAccountToken
      ) {
        const newEntry: ServiceAccountTokenWithAccess = {
          id: accountPermission.authToken.id,
          entityType: "serviceAccountToken",
          name: accountPermission.authToken.name,
          permissions: [],
          lastUsed: accountPermission.authToken.lastUsed,
        };
        addPermission(accountPermission.permission, newEntry);
      } else if (accountPermission.user) {
        const userEntry: UserWithAccess = {
          id: accountPermission.user.id,
          entityType: "user",
          permissions: [],
          user: accountPermission.user,
          personalAccessTokens: (accountPermission.user.authTokens || []).map(
            (authToken) => ({
              id: authToken.id,
              name: authToken.name,
              lastUsed: authToken.lastUsed,
            })
          ),
        };
        addPermission(accountPermission.permission, userEntry);
      }
    }

    res.json({
      accessList: Object.values(accessListMap),
    });
  }
);

export interface EndpointGetMicrofrontendAccessResBody {
  accessList: EntityWithAccess[];
}

export type EntityWithAccess = UserWithAccess | ServiceAccountTokenWithAccess;

export interface UserWithAccess {
  id: BaseplateUUID;
  entityType: "user";
  user: ShareableUserAttributes;
  permissions: Permission[];
  personalAccessTokens: PersonalAccessToken[];
}

export interface PersonalAccessToken {
  id: BaseplateUUID;
  name?: string;
  lastUsed?: Date;
}

export interface ServiceAccountTokenWithAccess {
  id: BaseplateUUID;
  entityType: "serviceAccountToken";
  name?: string;
  permissions: Permission[];
  lastUsed?: Date;
}
