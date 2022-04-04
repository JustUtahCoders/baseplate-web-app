import S from "sequelize";
import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import { MicrofrontendModel } from "./Microfrontend";
import { UserModel } from "./User";
import { JWTModel } from "./JWT";

const { Model, DataTypes } = S;

export class DeploymentModel
  extends Model<DeploymentAttributes, DeploymentCreationAttributes>
  implements DeploymentAttributes
{
  public id!: number;
  public microfrontendId!: number;
  public userId?: number;
  public foundryTokenId?: number;
  public cause: DeploymentCause;
  public status: DeploymentStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface DeploymentAttributes {
  id: number;
  microfrontendId: number;
  userId?: number;
  foundryTokenId?: number;
  cause: DeploymentCause;
  status: DeploymentStatus;
}

export type DeploymentCreationAttributes = Omit<DeploymentAttributes, "id">;

export type Deployment = DeploymentAttributes & DefaultModelAttrs;

export enum DeploymentCause {
  deploymentCLI = "deploymentCLI",
  manualAPICall = "manualAPICall",
  foundryWebApp = "foundryWebApp",
}

export enum DeploymentStatus {
  success = "success",
  failure = "failure",
}

modelEvents.once("init", (sequelize) => {
  DeploymentModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      microfrontendId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      foundryTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cause: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Deployment",
    }
  );
});

modelEvents.once("associate", (sequelize) => {
  DeploymentModel.belongsTo(MicrofrontendModel, {
    foreignKey: {
      name: "microfrontendId",
      allowNull: false,
    },
  });

  DeploymentModel.belongsTo(UserModel, {
    foreignKey: {
      name: "userId",
      allowNull: true,
    },
  });

  DeploymentModel.belongsTo(JWTModel, {
    foreignKey: {
      name: "foundryTokenId",
      allowNull: true,
    },
  });
});
