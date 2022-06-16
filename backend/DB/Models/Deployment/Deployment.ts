import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { AuthTokenModel } from "../AuthToken/AuthToken";
import { DeploymentLogModel } from "../DeploymentLog/DeploymentLog";
import { BaseplateUUID, HasManyMethods } from "../SequelizeTSHelpers";
import {
  Model,
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

export class DeploymentModel
  extends Model<DeploymentAttributes, DeploymentCreationAttributes>
  implements
    DeploymentAttributes,
    HasManyMethods<{ deploymentLog: DeploymentLogModel }>,
    HasManyMethods<{ deployedMicrofrontend: DeployedMicrofrontendModel }>
{
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare accountId: BaseplateUUID;
  declare cause: DeploymentCause;
  declare status: DeploymentStatus;
  declare environmentId: BaseplateUUID;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  public async deriveImportMap(this: DeploymentModel): Promise<ImportMap> {
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

  declare getBaseplateToken: BelongsToGetAssociationMixin<AuthTokenModel>;
  declare setBaseplateToken: BelongsToSetAssociationMixin<
    AuthTokenModel,
    number
  >;
  declare createBaseplateToken: BelongsToCreateAssociationMixin<AuthTokenModel>;

  declare getEnvironment: BelongsToGetAssociationMixin<EnvironmentModel>;
  declare setEnvironment: BelongsToSetAssociationMixin<
    EnvironmentModel,
    number
  >;
  declare createEnvironment: BelongsToCreateAssociationMixin<EnvironmentModel>;

  declare getDeploymentLogs: HasManyGetAssociationsMixin<DeploymentLogModel>;
  declare countDeploymentLogs: HasManyCountAssociationsMixin;
  declare hasDeploymentLog: HasManyHasAssociationMixin<
    DeploymentLogModel,
    number
  >;
  declare hasDeploymentLogs: HasManyHasAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  declare setDeploymentLogs: HasManySetAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  declare addDeploymentLog: HasManyAddAssociationMixin<
    DeploymentLogModel,
    number
  >;
  declare addDeploymentLogs: HasManyAddAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  declare removeDeploymentLog: HasManyRemoveAssociationMixin<
    DeploymentLogModel,
    number
  >;
  declare removeDeploymentLogs: HasManyRemoveAssociationsMixin<
    DeploymentLogModel,
    number
  >;
  declare createDeploymentLog: HasManyCreateAssociationMixin<DeploymentLogModel>;

  declare getDeployedMicrofrontends: HasManyGetAssociationsMixin<DeployedMicrofrontendModel>;
  declare countDeployedMicrofrontends: HasManyCountAssociationsMixin;
  declare hasDeployedMicrofrontend: HasManyHasAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare hasDeployedMicrofrontends: HasManyHasAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare setDeployedMicrofrontends: HasManySetAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare addDeployedMicrofrontend: HasManyAddAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare addDeployedMicrofrontends: HasManyAddAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare removeDeployedMicrofrontend: HasManyRemoveAssociationMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare removeDeployedMicrofrontends: HasManyRemoveAssociationsMixin<
    DeployedMicrofrontendModel,
    number
  >;
  declare createDeployedMicrofrontend: HasManyCreateAssociationMixin<DeployedMicrofrontendModel>;
}

export interface DeploymentAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
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
    as: "deploymentLog",
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
