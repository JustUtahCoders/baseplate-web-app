import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { BaseplateUUID, BelongsToManyMethods } from "../SequelizeTSHelpers";
import S, {
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
} from "sequelize";
import { currentSchema } from "./UserSchema.js";
import { AccountPermissionModel } from "../IAM/AccountPermission";
import { AccountRoleModel } from "../IAM/AccountRole";

const { Model, DataTypes } = S;

export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements
    UserAttributes,
    BelongsToManyMethods<{
      customerOrg: CustomerOrgModel;
      role: AccountRoleModel;
      permission: AccountPermissionModel;
    }>
{
  public id!: BaseplateUUID;
  public givenName!: string;
  public familyName!: string;
  public email!: string;
  public password: string | null;
  public githubProfileId: string | null;

  public getCustomerOrgs!: BelongsToManyGetAssociationsMixin<CustomerOrgModel>;
  public countCustomerOrgs!: BelongsToManyCountAssociationsMixin;
  public hasCustomerOrg!: BelongsToManyHasAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public hasCustomerOrgs!: BelongsToManyHasAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  public setCustomerOrgs!: BelongsToManySetAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  public addCustomerOrg!: BelongsToManyAddAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public addCustomerOrgs!: BelongsToManyAddAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  public removeCustomerOrg!: BelongsToManyRemoveAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public removeCustomerOrgs!: BelongsToManyRemoveAssociationsMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToManyCreateAssociationMixin<CustomerOrgModel>;

  public getRoles!: BelongsToManyGetAssociationsMixin<AccountRoleModel>;
  public countRoles!: BelongsToManyCountAssociationsMixin;
  public hasRole!: BelongsToManyHasAssociationMixin<AccountRoleModel, number>;
  public hasRoles!: BelongsToManyHasAssociationsMixin<AccountRoleModel, number>;
  public setRoles!: BelongsToManySetAssociationsMixin<AccountRoleModel, number>;
  public addRole!: BelongsToManyAddAssociationMixin<AccountRoleModel, number>;
  public addRoles!: BelongsToManyAddAssociationsMixin<AccountRoleModel, number>;
  public removeRole!: BelongsToManyRemoveAssociationMixin<
    AccountRoleModel,
    number
  >;
  public removeRoles!: BelongsToManyRemoveAssociationsMixin<
    AccountRoleModel,
    number
  >;
  public createRole!: BelongsToManyCreateAssociationMixin<AccountRoleModel>;

  public getPermissions!: BelongsToManyGetAssociationsMixin<AccountPermissionModel>;
  public countPermissions!: BelongsToManyCountAssociationsMixin;
  public hasPermission!: BelongsToManyHasAssociationMixin<
    AccountPermissionModel,
    number
  >;
  public hasPermissions!: BelongsToManyHasAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  public setPermissions!: BelongsToManySetAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  public addPermission!: BelongsToManyAddAssociationMixin<
    AccountPermissionModel,
    number
  >;
  public addPermissions!: BelongsToManyAddAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  public removePermission!: BelongsToManyRemoveAssociationMixin<
    AccountPermissionModel,
    number
  >;
  public removePermissions!: BelongsToManyRemoveAssociationsMixin<
    AccountPermissionModel,
    number
  >;
  public createPermission!: BelongsToManyCreateAssociationMixin<AccountPermissionModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
});
