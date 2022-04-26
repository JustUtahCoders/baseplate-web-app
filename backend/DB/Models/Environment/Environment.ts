import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import S, {
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
import { UserModel } from "../User/User";

const { Model } = S;

export class EnvironmentModel
  extends Model<EnvironmentAttributes, EnvironmentCreationAttributes>
  implements
    DefaultModelAttrs,
    EnvironmentAttributes,
    BelongsToMethods<{ customerOrg: string }, CustomerOrgModel>,
    BelongsToMethods<{ auditUser: string }, UserModel>
{
  public id!: BaseplateUUID;
  public customerOrgId!: BaseplateUUID;
  public name!: string;
  public isProd!: boolean;

  public auditUserId!: BaseplateUUID;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getCustomerOrg!: BelongsToGetAssociationMixin<CustomerOrgModel>;
  public setCustomerOrg!: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  public getAuditUser!: BelongsToGetAssociationMixin<UserModel>;
  public setAuditUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createAuditUser!: BelongsToCreateAssociationMixin<UserModel>;
}

export interface EnvironmentAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  name: BaseplateUUID;
  isProd: boolean;
}

export type EnvironmentCreationAttributes = Omit<EnvironmentAttributes, "id">;

export type Environment = EnvironmentAttributes & DefaultModelAttrs;

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

  EnvironmentModel.belongsTo(UserModel, {
    as: "AuditUser",
    foreignKey: {
      name: "auditUserId",
      allowNull: false,
    },
  });
});
