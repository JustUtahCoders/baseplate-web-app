import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import {
  Model,
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

export class DeployedMicrofrontendModel
  extends Model<DeployedMicrofrontend, DeployedMicrofrontendCreationAttributes>
  implements
    DeployedMicrofrontendAttributes,
    BelongsToMethods<{
      deployment: DeploymentModel;
      microfrontend: MicrofrontendModel;
    }>,
    DefaultModelAttrs
{
  declare id: BaseplateUUID;
  declare microfrontendId: BaseplateUUID;
  declare deploymentId: BaseplateUUID;
  declare bareImportSpecifier: string;
  declare entryUrl: string;
  declare trailingSlashUrl: string;
  declare deploymentChangedMicrofrontend: boolean;
  declare auditAccountId: BaseplateUUID;
  declare alias1?: string;
  declare alias2?: string;
  declare alias3?: string;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getDeployment: BelongsToGetAssociationMixin<DeploymentModel>;
  declare setDeployment: BelongsToSetAssociationMixin<DeploymentModel, number>;
  declare createDeployment: BelongsToCreateAssociationMixin<DeploymentModel>;

  declare getMicrofrontend: BelongsToGetAssociationMixin<MicrofrontendModel>;
  declare setMicrofrontend: BelongsToSetAssociationMixin<
    MicrofrontendModel,
    number
  >;
  declare createMicrofrontend: BelongsToCreateAssociationMixin<MicrofrontendModel>;
}

export class DeployedMicrofrontendAuditModel extends AuditModel<DeployedMicrofrontendAttributes> {}

export interface DeployedMicrofrontendAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  deploymentId: BaseplateUUID;
  microfrontendId: BaseplateUUID;
  bareImportSpecifier: BaseplateUUID;
  entryUrl: string;
  trailingSlashUrl?: string;
  alias1?: string;
  alias2?: string;
  alias3?: string;
  deploymentChangedMicrofrontend: boolean;
}

export type DeployedMicrofrontendCreationAttributes = Omit<
  DeployedMicrofrontendAttributes,
  "id"
>;

export type DeployedMicrofrontend = DeployedMicrofrontendAttributes &
  DefaultModelAttrs;

const modelName = "DeployedMicrofrontends";

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
