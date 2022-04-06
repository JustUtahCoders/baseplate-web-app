import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import { UserModel } from "./User";
import { BelongsToMethods, BelongsToManyMethods } from "./SequelizeTSHelpers";
import S, {
  BelongsToManyCountAssociationsMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from "sequelize";

const { Model, DataTypes } = S;

export class CustomerOrgModel
  extends Model<CustomerOrgAttributes, CustomerOrgCreationAttributes>
  implements
    CustomerOrgAttributes,
    BelongsToMethods<{ billingUser: string }, UserModel>,
    BelongsToManyMethods<{ user: string }, UserModel>
{
  public id!: number;
  public name!: string;
  public accountEnabled!: boolean;
  public billingUserId!: number;
  public orgKey!: string;

  public getBillingUser!: BelongsToGetAssociationMixin<UserModel>;
  public setBillingUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createBillingUser!: BelongsToCreateAssociationMixin<UserModel>;

  public getUsers!: BelongsToManyGetAssociationsMixin<UserModel>;
  public countUsers!: BelongsToManyCountAssociationsMixin;
  public hasUser!: BelongsToManyHasAssociationMixin<UserModel, number>;
  public hasUsers!: BelongsToManyHasAssociationsMixin<UserModel, number>;
  public setUsers!: BelongsToManySetAssociationsMixin<UserModel, number>;
  public addUser!: BelongsToManyAddAssociationMixin<UserModel, number>;
  public addUsers!: BelongsToManyAddAssociationsMixin<UserModel, number>;
  public removeUser!: BelongsToManyRemoveAssociationMixin<UserModel, number>;
  public removeUsers!: BelongsToManyRemoveAssociationsMixin<UserModel, number>;
  public createUser!: BelongsToManyCreateAssociationMixin<UserModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface CustomerOrgAttributes {
  id: number;
  name: string;
  accountEnabled: boolean;
  billingUserId: number;
  orgKey: string;
}

export type CustomerOrgCreationAttributes = Omit<CustomerOrgAttributes, "id">;

export type CustomerOrg = CustomerOrgAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  CustomerOrgModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      billingUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orgKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CustomerOrg",
    }
  );
});

modelEvents.once("associate", (sequelize) => {
  CustomerOrgModel.belongsTo(UserModel, {
    foreignKey: {
      name: "billingUserId",
      allowNull: false,
    },
    as: "billingUser",
  });

  CustomerOrgModel.belongsToMany(UserModel, {
    through: "UserCustomerOrgs",
  });
});
