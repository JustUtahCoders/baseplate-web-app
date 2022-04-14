import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import { MicrofrontendModel } from "./Microfrontend";
import { UserModel } from "./User";
import { JWTModel } from "./JWT";
import { DeploymentLogModel } from "./DeploymentLogs";
import { BelongsToMethods, HasManyMethods } from "./SequelizeTSHelpers";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyCountAssociationsMixin,
} from "sequelize";

const { Model, DataTypes } = S;

export class DeploymentModel
  extends Model<DeploymentAttributes, DeploymentCreationAttributes>
  implements
    DeploymentAttributes,
    BelongsToMethods<{ microfrontend: string }, MicrofrontendModel>,
    BelongsToMethods<{ user: string }, UserModel>,
    BelongsToMethods<{ baseplateToken: string }, JWTModel>,
    HasManyMethods<{ deployment: string }, DeploymentModel>
{
  public id!: number;
  public microfrontendId!: number;
  public userId?: number;
  public baseplateTokenId?: number;
  public cause: DeploymentCause;
  public status: DeploymentStatus;

  public getMicrofrontend!: BelongsToGetAssociationMixin<MicrofrontendModel>;
  public setMicrofrontend!: BelongsToSetAssociationMixin<
    MicrofrontendModel,
    number
  >;
  public createMicrofrontend!: BelongsToCreateAssociationMixin<MicrofrontendModel>;

  public getUser!: BelongsToGetAssociationMixin<UserModel>;
  public setUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createUser!: BelongsToCreateAssociationMixin<UserModel>;

  public getBaseplateToken!: BelongsToGetAssociationMixin<JWTModel>;
  public setBaseplateToken!: BelongsToSetAssociationMixin<JWTModel, number>;
  public createBaseplateToken!: BelongsToCreateAssociationMixin<JWTModel>;

  public getDeployments!: HasManyGetAssociationsMixin<DeploymentModel>;
  public countDeployments!: HasManyCountAssociationsMixin;
  public hasDeployment!: HasManyHasAssociationMixin<DeploymentModel, number>;
  public hasDeployments!: HasManyHasAssociationsMixin<DeploymentModel, number>;
  public setDeployments!: HasManySetAssociationsMixin<DeploymentModel, number>;
  public addDeployment!: HasManyAddAssociationMixin<DeploymentModel, number>;
  public addDeployments!: HasManyAddAssociationsMixin<DeploymentModel, number>;
  public removeDeployment!: HasManyRemoveAssociationMixin<
    DeploymentModel,
    number
  >;
  public removeDeployments!: HasManyRemoveAssociationsMixin<
    DeploymentModel,
    number
  >;
  public createDeployment!: HasManyCreateAssociationMixin<DeploymentModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface DeploymentAttributes {
  id: number;
  microfrontendId: number;
  userId?: number;
  baseplateTokenId?: number;
  cause: DeploymentCause;
  status: DeploymentStatus;
}

export type DeploymentCreationAttributes = Omit<DeploymentAttributes, "id">;

export type Deployment = DeploymentAttributes & DefaultModelAttrs;

export enum DeploymentCause {
  deploymentCLI = "deploymentCLI",
  manualAPICall = "manualAPICall",
  baseplateWebApp = "baseplateWebApp",
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
      baseplateTokenId: {
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
      name: "baseplateTokenId",
      allowNull: true,
    },
  });

  DeploymentModel.hasMany(DeploymentLogModel, {
    foreignKey: "deploymentId",
  });
});
