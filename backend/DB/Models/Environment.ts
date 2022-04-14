import { DefaultModelAttrs } from "./DefaultModelAttrs";
import { modelEvents } from "../../InitDB";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { BelongsToMethods } from "./SequelizeTSHelpers";
import { CustomerOrgModel } from "./CustomerOrg";
import environmentInitOptions from "./EnvironmentInit";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "./Audit/Audit";

const { Model, DataTypes } = S;

export class EnvironmentModel
  extends Model<EnvironmentAttributes, EnvironmentCreationAttributes>
  implements
    DefaultModelAttrs,
    EnvironmentAttributes,
    BelongsToMethods<{ customerOrg: string }, CustomerOrgModel>
{
  public id!: number;
  public customerOrgId!: number;
  public name!: string;
  public isProd!: boolean;

  public auditUserId!: number;

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
  id: number;
  customerOrgId: number;
  name: string;
  isProd: boolean;
}

export type EnvironmentCreationAttributes = Omit<EnvironmentAttributes, "id">;

export type Environment = EnvironmentAttributes & DefaultModelAttrs;

const modelName = "Environments";

modelEvents.once("init", (sequelize) => {
  EnvironmentModel.init(environmentInitOptions, {
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

// Audit table
export class EnvironmentAuditModel extends AuditModel<EnvironmentAttributes> {}

// @ts-ignore
initAuditModel(EnvironmentAuditModel, EnvironmentModel, modelName);
