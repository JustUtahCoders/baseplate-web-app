import { DefaultModelAttrs } from "../DefaultModelAttrs";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { CustomerOrgModel } from "./CustomerOrg";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { modelEvents } from "../../../InitDB";
import { initialSchema } from "./StaticWebSettingsSchema";

const { Model } = S;

export class StaticWebSettingsModel
  extends Model<
    StaticWebSettingsAttributes,
    StaticWebSettingsCreationAttributes
  >
  implements
    DefaultModelAttrs,
    StaticWebSettingsAttributes,
    BelongsToMethods<{ customerOrg: CustomerOrgModel }>
{
  public id!: BaseplateUUID;
  public customerOrgId!: BaseplateUUID;
  public defaultCacheControl?: string;
  public importMapCacheControl?: string;
  public corsAllowOrigins: string[];
  public corsExposeHeaders: string[];
  public corsMaxAge: number;
  public corsAllowCredentials: boolean;
  public corsAllowMethods: string[];
  public corsAllowHeaders: string[];
  public auditAccountId!: BaseplateUUID;

  public getCustomerOrg!: BelongsToGetAssociationMixin<CustomerOrgModel>;
  public setCustomerOrg!: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

export interface StaticWebSettingsAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  defaultCacheControl?: string;
  importMapCacheControl?: string;
  corsAllowOrigins?: string[];
  corsExposeHeaders?: string[];
  corsMaxAge?: number;
  corsAllowCredentials?: boolean;
  corsAllowMethods?: string[];
  corsAllowHeaders?: string[];
}

export type StaticWebSettingsCreationAttributes = Omit<
  StaticWebSettingsAttributes,
  "id"
>;

export type StaticWebSettings = StaticWebSettingsAttributes & DefaultModelAttrs;

export class StaticWebSettingsAuditModel extends AuditModel<StaticWebSettingsModel> {}

const modelName = "StaticWebSettings";

initAuditModel(StaticWebSettingsAuditModel, StaticWebSettingsModel, modelName);

modelEvents.once("init", (sequelize) => {
  StaticWebSettingsModel.init(initialSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", () => {
  StaticWebSettingsModel.belongsTo(CustomerOrgModel, {
    as: "customerOrg",
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });
});
