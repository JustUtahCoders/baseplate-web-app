import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { AuthTokenModel } from "../AuthToken/AuthToken";
import { DeploymentLogModel } from "../DeploymentLog/DeploymentLog";
import {
  BaseplateUUID,
  BelongsToMethods,
  HasManyMethods,
} from "../SequelizeTSHelpers";
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
    HasManyMethods<{ deploymentLog: DeploymentLogModel }>,
    HasManyMethods<{ deployedMicrofrontend: DeployedMicrofrontendModel }>
{
  public id!: BaseplateUUID;
  public accountId!: BaseplateUUID;
  public cause!: DeploymentCause;
  public status!: DeploymentStatus;
  public environmentId!: BaseplateUUID;
  public auditAccountId!: BaseplateUUID;

  public async deriveImportMap(): Promise<ImportMap> {
    const deployedMicrofrontends = await this.getDeployedMicrofrontends();

    const importMap: ImportMap = {
      imports: {},
      scopes: {},
    };

    deployedMicrofrontends.forEach((deployedMicrofrontend) => {
      importMap.imports[deployedMicrofrontend.bareImportSpecifier] =
        deployedMicrofrontend.entryUrl;
      if (deployedMicrofrontend.trailingSlashUrl) {
        importMap.imports[deployedMicrofrontend.bareImportSpecifier + "/"] =
          deployedMicrofrontend.trailingSlashUrl;
      }
    });

    return importMap;
  }

  public getBaseplateToken!: BelongsToGetAssociationMixin<AuthTokenModel>;
  public setBaseplateToken!: BelongsToSetAssociationMixin<
    AuthTokenModel,
    number
  >;
  public createBaseplateToken!: BelongsToCreateAssociationMixin<AuthTokenModel>;

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

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface DeploymentAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  accountId: BaseplateUUID;
  environmentId: BaseplateUUID;
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
  pending = "pending",
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
  DeploymentModel.hasMany(DeploymentLogModel, {
    foreignKey: "deploymentId",
  });

  DeploymentModel.belongsTo(EnvironmentModel, {
    foreignKey: {
      name: "environmentId",
      allowNull: false,
    },
  });

  DeploymentModel.hasMany(DeployedMicrofrontendModel, {
    foreignKey: "deploymentId",
  });
});

export interface ImportMap {
  imports: ModuleMap;
  scopes: {
    [key: string]: ModuleMap;
  };
}

export interface ModuleMap {
  [key: string]: string;
}
