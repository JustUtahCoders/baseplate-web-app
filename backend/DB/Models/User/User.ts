import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { BelongsToManyMethods } from "../SequelizeTSHelpers";
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

const { Model, DataTypes } = S;

export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements
    UserAttributes,
    BelongsToManyMethods<{ customerOrg: string }, CustomerOrgModel>
{
  public id!: number;
  public givenName!: string;
  public familyName!: string;
  public email!: string;
  public password: string | null;
  public googleAuthToken: string | null;

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

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface UserAttributes {
  id: number;
  givenName: string;
  familyName: string;
  email: string;
  password: string | null;
  googleAuthToken: string | null;
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
});
