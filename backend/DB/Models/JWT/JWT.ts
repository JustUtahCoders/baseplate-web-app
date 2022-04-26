import { modelEvents } from "../../../InitDB";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { UserModel } from "../User/User";
import { BelongsToMethods } from "../SequelizeTSHelpers";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./JWTSchema";

const { Model } = S;

export class JWTModel
  extends Model<JWTAttributes, JWTCreationAttributes>
  implements
    JWTAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ user: string }, UserModel>,
    BelongsToMethods<{ customerOrg: string }, CustomerOrgModel>
{
  public id!: number;
  public token!: string;
  public userId!: number;
  public customerOrgId?: number;
  public jwtType!: JWTType;

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

export interface JWTAttributes {
  id: number;
  token: string;
  userId: number;
  customerOrgId?: number;
  jwtType: JWTType;
}

export enum JWTType {
  loginMFAEmail = "loginMFAEmail",
  passwordReset = "passwordReset",
  baseplateApiToken = "baseplateApiToken",
}

export type JWTCreationAttributes = Omit<JWTAttributes, "id">;

export type JWT = JWTAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  JWTModel.init(currentSchema, {
    sequelize,
    modelName: "JWT",
  });
});

modelEvents.once("associate", (sequelize) => {
  JWTModel.belongsTo(UserModel, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
  });

  JWTModel.belongsTo(CustomerOrgModel, {
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });
});