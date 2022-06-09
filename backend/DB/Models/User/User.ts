import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import {
  BaseplateUUID,
  BelongsToManyMethods,
  HasOneMethods,
} from "../SequelizeTSHelpers";
import {
  Model,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./UserSchema.js";
import { AccountPermissionModel } from "../IAM/AccountPermission";
import { AccountRoleModel } from "../IAM/AccountRole";
import { UserPreferencesModel } from "./UserPreferences";

export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements
    UserAttributes,
    BelongsToManyMethods<{
      customerOrg: CustomerOrgModel;
      role: AccountRoleModel;
      permission: AccountPermissionModel;
    }>,
    HasOneMethods<{ userPreferences: UserPreferencesModel }>,
    DefaultModelAttrs
{
  declare id: BaseplateUUID;
  declare givenName: string;
  declare familyName: string;
  declare email: string;
  declare password: string | null;
  declare githubProfileId: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getUserPreferences: HasOneGetAssociationMixin<UserPreferencesModel>;
  declare setUserPreferences: HasOneSetAssociationMixin<
    UserPreferencesModel,
    number
  >;
  declare createUserPreferences: HasOneCreateAssociationMixin<UserPreferencesModel>;

  declare getCustomerOrgs: BelongsToManyGetAssociationsMixin<CustomerOrgModel>;
  declare countCustomerOrgs: BelongsToManyCountAssociationsMixin;
  declare hasCustomerOrg: BelongsToManyHasAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare hasCustomerOrgs: BelongsToManyHasAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  declare setCustomerOrgs: BelongsToManySetAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  declare addCustomerOrg: BelongsToManyAddAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare addCustomerOrgs: BelongsToManyAddAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  declare removeCustomerOrg: BelongsToManyRemoveAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare removeCustomerOrgs: BelongsToManyRemoveAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  declare createCustomerOrg: BelongsToManyCreateAssociationMixin<CustomerOrgModel>;

  declare getRoles: BelongsToManyGetAssociationsMixin<AccountRoleModel>;
  declare countRoles: BelongsToManyCountAssociationsMixin;
  declare hasRole: BelongsToManyHasAssociationMixin<AccountRoleModel, number>;
  declare hasRoles: BelongsToManyHasAssociationsMixin<AccountRoleModel, number>;
  declare setRoles: BelongsToManySetAssociationsMixin<AccountRoleModel, number>;
  declare addRole: BelongsToManyAddAssociationMixin<AccountRoleModel, number>;
  declare addRoles: BelongsToManyAddAssociationsMixin<AccountRoleModel, number>;
  declare removeRole: BelongsToManyRemoveAssociationMixin<
    AccountRoleModel,
    number
  >;
  declare removeRoles: BelongsToManyRemoveAssociationsMixin<
    AccountRoleModel,
    number
  >;
  declare createRole: BelongsToManyCreateAssociationMixin<AccountRoleModel>;

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

export interface UserAttributes {
  id: BaseplateUUID;
  givenName: string;
  familyName: string;
  email: string;
  password: string | null;
  githubProfileId: string | null;
}

export type UserCreationAttributes = Omit<UserAttributes, "id">;

export type User = UserAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  UserModel.init(currentSchema, {
    sequelize,
    modelName: "User",
  });
});

modelEvents.once("associate", (sequelize) => {
  UserModel.belongsToMany(CustomerOrgModel, {
    through: "UserCustomerOrgs",
    foreignKey: "userId",
    otherKey: "customerOrgId",
  });

  UserModel.hasMany(AccountPermissionModel, {
    as: "permission",
    foreignKey: "accountId",
  });

  UserModel.hasMany(AccountRoleModel, {
    as: "role",
    foreignKey: "accountId",
  });

  UserModel.hasOne(UserPreferencesModel, {
    as: "userPreferences",
    foreignKey: "userId",
  });
});
