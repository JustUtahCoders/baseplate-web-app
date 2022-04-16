import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { UserModel } from "../User/User";
import { JWTModel } from "../JWT/JWT";
import { DeploymentLogModel } from "../DeploymentLog/DeploymentLog";
import { BelongsToMethods, HasManyMethods } from "../SequelizeTSHelpers";
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
import { DeployedMicrofrontendModel } from "../DeployedMicrofrontend/DeployedMicrofrontend";
import { currentSchema } from "./DeploymentSchema";
import { AuditTargetAttributes } from "../Audit/Audit";
import { EnvironmentModel } from "../Environment/Environment";

const { Model } = S;

export class DeploymentModel
  extends Model<DeploymentAttributes, DeploymentCreationAttributes>
  implements
    DeploymentAttributes,
    BelongsToMethods<{ user: string }, UserModel>,
    BelongsToMethods<{ baseplateToken: string }, JWTModel>,
    HasManyMethods<{ deploymentLog: string }, DeploymentLogModel>,
    HasManyMethods<
      { deployedMicrofrontend: string },
      DeployedMicrofrontendModel
    >,
    BelongsToMethods<{ auditUser: string }, UserModel>,
    BelongsToMethods<{ environment: string }, EnvironmentModel>
{
  public id!: number;
  public userId?: number;
  public baseplateTokenId?: number;
  public cause!: DeploymentCause;
  public status!: DeploymentStatus;
  public environmentId!: number;
  public auditUserId!: number;

  public getUser!: BelongsToGetAssociationMixin<UserModel>;
  public setUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createUser!: BelongsToCreateAssociationMixin<UserModel>;

  public getBaseplateToken!: BelongsToGetAssociationMixin<JWTModel>;
  public setBaseplateToken!: BelongsToSetAssociationMixin<JWTModel, number>;
  public createBaseplateToken!: BelongsToCreateAssociationMixin<JWTModel>;

  public getEnvironment!: BelongsToGetAssociationMixin<EnvironmentModel>;
  public setEnvironment!: BelongsToSetAssociationMixin<
    EnvironmentModel,
    number
  >;
  public createEnvironment!: BelongsToCreateAssociationMixin<EnvironmentModel>;

  public getDeploymentLogs!: HasManyGetAssociationsMixin<DeploymentLogModel>;
  public countDeploymentLogs!: HasManyCountAssociationsMixin;
  public hasDeploymentLog!: HasManyHasAssociationMixin<
    DeploymentLogModel,
    number
  >;
  public hasDeploymentLogs!: HasManyHasAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  public setDeploymentLogs!: HasManySetAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  public addDeploymentLog!: HasManyAddAssociationMixin<
    DeploymentLogModel,
    number
  >;
  public addDeploymentLogs!: HasManyAddAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  public removeDeploymentLog!: HasManyRemoveAssociationMixin<
    DeploymentLogModel,
    number
  >;
  public removeDeploymentLogs!: HasManyRemoveAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  public createDeploymentLog!: HasManyCreateAssociationMixin<DeploymentLogModel>;

  public getDeployedMicrofrontends!: HasManyGetAssociationsMixin<DeployedMicrofrontendModel>;
  public countDeployedMicrofrontends!: HasManyCountAssociationsMixin;
  public hasDeployedMicrofrontend!: HasManyHasAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public hasDeployedMicrofrontends!: HasManyHasAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public setDeployedMicrofrontends!: HasManySetAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public addDeployedMicrofrontend!: HasManyAddAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public addDeployedMicrofrontends!: HasManyAddAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public removeDeployedMicrofrontend!: HasManyRemoveAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public removeDeployedMicrofrontends!: HasManyRemoveAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  public createDeployedMicrofrontend!: HasManyCreateAssociationMixin<DeployedMicrofrontendModel>;

  public getAuditUser!: BelongsToGetAssociationMixin<UserModel>;
  public setAuditUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createAuditUser!: BelongsToCreateAssociationMixin<UserModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface DeploymentAttributes extends AuditTargetAttributes {
  id: number;
  userId?: number;
  baseplateTokenId?: number;
  environmentId: number;
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
  DeploymentModel.init(currentSchema, {
    sequelize,
    modelName: "Deployment",
  });
});

modelEvents.once("associate", (sequelize) => {
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

  DeploymentModel.belongsTo(UserModel, {
    as: "AuditUser",
    foreignKey: {
      name: "auditUserId",
      allowNull: false,
    },
  });

  DeploymentModel.belongsTo(EnvironmentModel, {
    foreignKey: {
      name: "environmentId",
      allowNull: false,
    },
  });
});
