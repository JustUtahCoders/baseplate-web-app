import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { DeploymentModel } from "../Deployment/Deployment";
import { MicrofrontendModel } from "../Microfrontend/Microfrontend";
import { currentSchema } from "./DeployedMicrofrontendSchema";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { UserModel } from "../User/User";

const { Model } = S;

export class DeployedMicrofrontendModel
  extends Model<
    DeployedMicrofrontendAttributes,
    DeployedMicrofrontendCreationAttributes
  >
  implements
    DeployedMicrofrontendAttributes,
    BelongsToMethods<{
      deployment: DeploymentModel;
      microfrontend: MicrofrontendModel;
    }>
{
  public id!: BaseplateUUID;
  public microfrontendId!: BaseplateUUID;
  public deploymentId!: BaseplateUUID;
  public bareImportSpecifier: string;
  public entryUrl!: string;
  public trailingSlashUrl!: string;
  public deploymentChangedMicrofrontend!: boolean;
  public auditAccountId!: BaseplateUUID;

  public getDeployment!: BelongsToGetAssociationMixin<DeploymentModel>;
  public setDeployment!: BelongsToSetAssociationMixin<DeploymentModel, number>;
  public createDeployment!: BelongsToCreateAssociationMixin<DeploymentModel>;

  public getMicrofrontend!: BelongsToGetAssociationMixin<MicrofrontendModel>;
  public setMicrofrontend!: BelongsToSetAssociationMixin<
    MicrofrontendModel,
    number
  >;
  public createMicrofrontend!: BelongsToCreateAssociationMixin<MicrofrontendModel>;
}

export class DeployedMicrofrontendAuditModel extends AuditModel<DeployedMicrofrontendAttributes> {}

export interface DeployedMicrofrontendAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  deploymentId: BaseplateUUID;
  microfrontendId: BaseplateUUID;
  bareImportSpecifier: BaseplateUUID;
  entryUrl: string;
  trailingSlashUrl?: string;
  deploymentChangedMicrofrontend: boolean;
}

export type DeployedMicrofrontendCreationAttributes = Omit<
  DeployedMicrofrontendAttributes,
  "id"
>;

export type DeployedMicrofrontend = DeployedMicrofrontendAttributes &
  DefaultModelAttrs;

const modelName = "DeployedMicrofrontend";

modelEvents.once("init", (sequelize) => {
  DeployedMicrofrontendModel.init(currentSchema, { sequelize, modelName });
});

modelEvents.once("associate", (sequelize) => {
  DeployedMicrofrontendModel.belongsTo(MicrofrontendModel, {
    foreignKey: {
      name: "microfrontendId",
      allowNull: false,
    },
  });

  DeployedMicrofrontendModel.belongsTo(DeploymentModel, {
    foreignKey: {
      name: "deploymentId",
      allowNull: false,
    },
  });
});

initAuditModel(
  DeployedMicrofrontendAuditModel,
  DeployedMicrofrontendModel,
  modelName
);
