import { Model, DataTypes, literal } from "sequelize";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { DeploymentModel } from "../Deployment/Deployment";
import { BaseplateUUID } from "../SequelizeTSHelpers";

export class DeploymentLogModel
  extends Model<DeploymentLogAttributes, DeploymentLogCreationAttributes>
  implements DeploymentLogAttributes
{
  public id!: BaseplateUUID;
  public deploymentId!: BaseplateUUID;
  public label!: string;
  public text!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface DeploymentLogAttributes {
  id: BaseplateUUID;
  deploymentId: BaseplateUUID;
  label: string;
  text: string;
}

export type DeploymentLogCreationAttributes = Omit<
  DeploymentLogAttributes,
  "id"
>;

export type DeploymentLog = DeploymentLogAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  DeploymentLogModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: literal("gen_random_uuid()"),
        primaryKey: true,
      },
      deploymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DeploymentLog",
    }
  );
});

modelEvents.once("associate", (sequelize) => {
  DeploymentLogModel.belongsTo(DeploymentModel, {
    foreignKey: {
      name: "deploymentId",
      allowNull: false,
    },
  });
});
