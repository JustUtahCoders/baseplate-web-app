import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { UserModel } from "../User/User";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./AuthTokenSchema";

const { Model } = S;

export class AuthTokenModel
  extends Model<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements
    AuthTokenAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ user: string }, UserModel>,
    BelongsToMethods<{ customerOrg: string }, CustomerOrgModel>
{
  public id!: BaseplateUUID;
  public userId!: BaseplateUUID;
  public customerOrgId?: BaseplateUUID;
  public authTokenType!: AuthTokenType;

  public getUser!: BelongsToGetAssociationMixin<UserModel>;
  public setUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createUser!: BelongsToCreateAssociationMixin<UserModel>;

  public getCustomerOrg!: BelongsToGetAssociationMixin<CustomerOrgModel>;
  public setCustomerOrg!: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface AuthTokenAttributes {
  id: BaseplateUUID;
  userId: BaseplateUUID;
  customerOrgId?: BaseplateUUID;
  authTokenType: AuthTokenType;
}

export enum AuthTokenType {
  loginMFAEmail = "loginMFAEmail",
  passwordReset = "passwordReset",
  baseplateApiToken = "baseplateApiToken",
}

export type AuthTokenCreationAttributes = Omit<AuthTokenAttributes, "id">;

export type AuthToken = AuthTokenAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  AuthTokenModel.init(currentSchema, {
    sequelize,
    modelName: "AuthToken",
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
});
