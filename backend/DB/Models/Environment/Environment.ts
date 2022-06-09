import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { currentSchema } from "./EnvironmentSchema";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";

export class EnvironmentModel
  extends Model<EnvironmentAttributes, EnvironmentCreationAttributes>
  implements
    DefaultModelAttrs,
    EnvironmentAttributes,
    BelongsToMethods<{ customerOrg: CustomerOrgModel }>
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
});
