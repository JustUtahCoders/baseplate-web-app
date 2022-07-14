import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { AuthTokenModel } from "../AuthToken/AuthToken";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { UserModel } from "../User/User";
import { currentSchema } from "./AccountPermissionSchema";
import { PermissionModel } from "./Permission";

export class AccountPermissionModel
  extends Model<
    AccountPermissionAttributes,
    AccountPermissionCreationAttributes
  >
  implements
    AccountPermissionAttributes,
    BelongsToMethods<{
      permission: PermissionModel;
      user: UserModel;
      authToken: AuthTokenModel;
    }>
{
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare accountId: BaseplateUUID;
  declare permissionId: BaseplateUUID;
  declare entityId: BaseplateUUID;
  declare dateRevoked: Date;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getPermission: BelongsToGetAssociationMixin<PermissionModel>;
  declare setPermission: BelongsToSetAssociationMixin<PermissionModel, number>;
  declare createPermission: BelongsToCreateAssociationMixin<PermissionModel>;

  declare getUser: BelongsToGetAssociationMixin<UserModel>;
  declare setUser: BelongsToSetAssociationMixin<UserModel, number>;
  declare createUser: BelongsToCreateAssociationMixin<UserModel>;

  declare getAuthToken: BelongsToGetAssociationMixin<AuthTokenModel>;
  declare setAuthToken: BelongsToSetAssociationMixin<AuthTokenModel, number>;
  declare createAuthToken: BelongsToCreateAssociationMixin<AuthTokenModel>;
}

export interface AccountPermissionAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  accountId: BaseplateUUID;
  permissionId: BaseplateUUID;
  entityId?: BaseplateUUID;
  dateRevoked?: Date;
}

export type AccountPermissionCreationAttributes = Omit<
  AccountPermissionAttributes,
  "id"
>;

export type AccountPermission = AccountPermissionAttributes & DefaultModelAttrs;

export class AccountPermissionAuditModel extends AuditModel<AccountPermissionAttributes> {}

const modelName = "AccountPermissions";

initAuditModel(AccountPermissionAuditModel, AccountPermissionModel, modelName);

modelEvents.once("init", (sequelize) => {
  AccountPermissionModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", () => {
  AccountPermissionModel.belongsTo(PermissionModel, {
    as: "permission",
    foreignKey: "permissionId",
  });

  AccountPermissionModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "accountId",
  });

  AccountPermissionModel.belongsTo(AuthTokenModel, {
    as: "authToken",
    foreignKey: "accountId",
  });
});
