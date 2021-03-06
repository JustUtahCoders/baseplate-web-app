import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { UserModel } from "../User/User";
import {
  BaseplateUUID,
  BelongsToMethods,
  HasManyMethods,
} from "../SequelizeTSHelpers";
import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./AuthTokenSchema";
import { AuditModel, initAuditModel } from "../Audit/Audit";
import { AccountPermissionModel } from "../IAM/AccountPermission";

export class AuthTokenModel
  extends Model<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements
    AuthTokenAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ user: UserModel; customerOrg: CustomerOrgModel }>,
    HasManyMethods<{ permission: AccountPermissionModel }>
{
  declare id: BaseplateUUID;
  declare authTokenType: AuthTokenType;
  declare secretAccessKey: BaseplateUUID;
  declare name?: string;
  declare userId?: BaseplateUUID;
  declare customerOrgId?: BaseplateUUID;
  declare lastUsed?: Date;
  declare dateRevoked: Date;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getUser: BelongsToGetAssociationMixin<UserModel>;
  declare setUser: BelongsToSetAssociationMixin<UserModel, number>;
  declare createUser: BelongsToCreateAssociationMixin<UserModel>;

  declare getCustomerOrg: BelongsToGetAssociationMixin<CustomerOrgModel>;
  declare setCustomerOrg: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare createCustomerOrg: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  declare getPermissions: BelongsToManyGetAssociationsMixin<AccountPermissionModel>;
  declare countPermissions: BelongsToManyCountAssociationsMixin;
  declare hasPermission: BelongsToManyHasAssociationMixin<
    AccountPermissionModel,
    number
  >;
  declare hasPermissions: BelongsToManyHasAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  declare setPermissions: BelongsToManySetAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  declare addPermission: BelongsToManyAddAssociationMixin<
    AccountPermissionModel,
    number
  >;
  declare addPermissions: BelongsToManyAddAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  declare removePermission: BelongsToManyRemoveAssociationMixin<
    AccountPermissionModel,
    number
  >;
  declare removePermissions: BelongsToManyRemoveAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  declare createPermission: BelongsToManyCreateAssociationMixin<AccountPermissionModel>;
}

export interface AuthTokenAttributes {
  id: BaseplateUUID;
  authTokenType: AuthTokenType;
  secretAccessKey: BaseplateUUID;
  auditAccountId: BaseplateUUID;
  name?: string;
  userId?: BaseplateUUID;
  customerOrgId?: BaseplateUUID;
  lastUsed?: Date;
  dateRevoked?: Date;
}

export enum AuthTokenType {
  loginMFAEmail = "loginMFAEmail",
  passwordReset = "passwordReset",
  serviceAccountToken = "serviceAccountToken",
  personalAccessToken = "personalAccessToken",
  webAppCodeAccess = "webAppCodeAccess",
}

export type AuthTokenCreationAttributes = Omit<
  Omit<AuthTokenAttributes, "id">,
  "secretAccessKey"
>;

export type AuthToken = AuthTokenAttributes & DefaultModelAttrs;

export class AuthTokenAuditModel extends AuditModel<AuthTokenAttributes> {}

const modelName = "AuthToken";

initAuditModel(AuthTokenAuditModel, AuthTokenModel, modelName);

modelEvents.once("init", (sequelize) => {
  AuthTokenModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", (sequelize) => {
  AuthTokenModel.belongsTo(UserModel, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
  });

  AuthTokenModel.belongsTo(CustomerOrgModel, {
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });

  AuthTokenModel.hasMany(AccountPermissionModel, {
    as: "permission",
    foreignKey: "accountId",
  });
});
