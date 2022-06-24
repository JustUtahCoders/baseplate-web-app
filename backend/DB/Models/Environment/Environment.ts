import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import {
  BaseplateUUID,
  BelongsToMethods,
  HasManyMethods,
} from "../SequelizeTSHelpers";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { currentSchema } from "./EnvironmentSchema";
import { DeploymentModel } from "../Deployment/Deployment";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";

export class EnvironmentModel
  extends Model<EnvironmentAttributes, EnvironmentCreationAttributes>
  implements
    Environment,
    BelongsToMethods<{ customerOrg: CustomerOrgModel }>,
    HasManyMethods<{ deployment: DeploymentModel }>
{
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare name: string;
  declare isProd: boolean;
  declare useBaseplateStaticWebHosting: boolean;
  declare staticWebProxyHost: string;
  declare pipelineOrder: number;

  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getCustomerOrg: BelongsToGetAssociationMixin<CustomerOrgModel>;
  declare setCustomerOrg: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare createCustomerOrg: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  declare getDeployments: HasManyGetAssociationsMixin<DeploymentModel>;
  declare countDeployments: HasManyCountAssociationsMixin;
  declare hasDeployment: HasManyHasAssociationMixin<DeploymentModel, number>;
  declare hasDeployments: HasManyHasAssociationsMixin<DeploymentModel, number>;
  declare setDeployments: HasManySetAssociationsMixin<DeploymentModel, number>;
  declare addDeployment: HasManyAddAssociationMixin<DeploymentModel, number>;
  declare addDeployments: HasManyAddAssociationsMixin<DeploymentModel, number>;
  declare removeDeployment: HasManyRemoveAssociationMixin<
    DeploymentModel,
    number
  >;
  declare removeDeployments: HasManyRemoveAssociationsMixin<
    DeploymentModel,
    number
  >;
  declare createDeployment: HasManyCreateAssociationMixin<DeploymentModel>;
}

export interface EnvironmentAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  name: BaseplateUUID;
  isProd: boolean;
  pipelineOrder: number;
  useBaseplateStaticWebHosting: boolean;
  staticWebProxyHost: string;
}

export type EnvironmentCreationAttributes = Omit<EnvironmentAttributes, "id">;

export type Environment = Omit<
  Omit<EnvironmentAttributes & DefaultModelAttrs, "auditAccountId">,
  "customerOrgId"
>;

export class EnvironmentAuditModel extends AuditModel<EnvironmentAttributes> {}

const modelName = "Environments";

initAuditModel(EnvironmentAuditModel, EnvironmentModel, modelName);

modelEvents.once("init", (sequelize) => {
  EnvironmentModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", () => {
  EnvironmentModel.belongsTo(CustomerOrgModel, {
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });

  EnvironmentModel.hasMany(DeploymentModel, {
    foreignKey: "environmentId",
    as: "deployment",
  });
});
