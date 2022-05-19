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
  public id!: BaseplateUUID;
  public customerOrgId!: BaseplateUUID;
  public name!: string;
  public isProd!: boolean;
  public useBaseplateStaticWebHosting!: boolean;
  public staticWebProxyHost!: string;

  public auditAccountId!: BaseplateUUID;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getCustomerOrg!: BelongsToGetAssociationMixin<CustomerOrgModel>;
  public setCustomerOrg!: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToCreateAssociationMixin<CustomerOrgModel>;
}

export interface EnvironmentAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  name: BaseplateUUID;
  isProd: boolean;
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
