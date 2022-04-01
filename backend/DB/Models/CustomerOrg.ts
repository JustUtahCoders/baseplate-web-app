import S from "sequelize";
import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import { UserModel } from "./User";

const { Model, DataTypes } = S;

export class CustomerOrgModel
  extends Model<CustomerOrgAttributes, CustomerOrgCreationAttributes>
  implements CustomerOrgAttributes
{
  public id!: number;
  public name!: string;
  public accountEnabled!: boolean;
  public billingUserId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface CustomerOrgAttributes {
  id: number;
  name: string;
  accountEnabled: boolean;
  billingUserId: number;
}

export type CustomerOrgCreationAttributes = Omit<CustomerOrgAttributes, "id">;

export type CustomerOrg = CustomerOrgAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  CustomerOrgModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
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
        type: DataTypes.INTEGER.UNSIGNED,
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
  });

  CustomerOrgModel.belongsToMany(UserModel, {
    through: "UserCustomerOrgs",
  });
});
