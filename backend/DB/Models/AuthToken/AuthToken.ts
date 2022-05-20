import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { UserModel } from "../User/User";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./AuthTokenSchema";

export class AuthTokenModel
  extends Model<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements
    AuthTokenAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ user: UserModel; customerOrg: CustomerOrgModel }>
{
  declare id: BaseplateUUID;
  declare userId: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare authTokenType: AuthTokenType;
  declare dateRevoked: Date;

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
}

export interface AuthTokenAttributes {
  id: BaseplateUUID;
  userId?: BaseplateUUID;
  customerOrgId?: BaseplateUUID;
  authTokenType: AuthTokenType;
  dateRevoked?: Date;
}

export enum AuthTokenType {
  loginMFAEmail = "loginMFAEmail",
  passwordReset = "passwordReset",
  baseplateApiToken = "baseplateApiToken",
  webAppCodeAccess = "webAppCodeAccess",
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
