import S from "sequelize";
import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import { CustomerOrgModel } from "./CustomerOrg";

const { Model, DataTypes } = S;

export class MicrofrontendModel
  extends Model<MicrofrontendAttributes, MicrofrontendCreationAttributes>
  implements MicrofrontendAttributes
{
  public id!: number;
  public customerOrgId!: number;
  public name!: string;
  public scope?: string;
  public useCustomerOrgKeyAsScope: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface MicrofrontendAttributes {
  id: number;
  customerOrgId: number;
  // A lowercase string. For example, "navbar" or "settings"
  name: string;
  /*
    The scope is the part of the name after the @ and before the /

    For example, @myscope/myname

    This is a borrowed naming convention from the NPM ecosystem
  */
  scope?: string;
  /*
    Each customer has an orgKey property that can be used as the scope. The orgKey
    is used in foundry-worker to identify which customer the request is for.
  */
  useCustomerOrgKeyAsScope: boolean;
}

export type MicrofrontendCreationAttributes = Omit<
  MicrofrontendAttributes,
  "id"
>;

export type Microfrontend = MicrofrontendAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  MicrofrontendModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerOrgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scope: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      useCustomerOrgKeyAsScope: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Microfrontend",
    }
  );
});

modelEvents.once("associate", (sequelize) => {
  MicrofrontendModel.belongsTo(CustomerOrgModel, {
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });
});
