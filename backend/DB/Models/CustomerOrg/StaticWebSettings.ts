import { DefaultModelAttrs } from "../DefaultModelAttrs";
import {
  Model,
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

export class StaticWebSettingsModel
  extends Model<
    StaticWebSettingsAttributes,
    StaticWebSettingsCreationAttributes
  >
  implements
    StaticWebSettingsAttributes,
    DefaultModelAttrs,
    StaticWebSettingsAttributes,
    BelongsToMethods<{ customerOrg: CustomerOrgModel }>
{
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare defaultCacheControl: string;
  declare importMapCacheControl: string;
  declare corsAllowOrigins: string[];
  declare corsExposeHeaders: string[];
  declare corsMaxAge: number;
  declare corsAllowCredentials: boolean;
  declare corsAllowMethods: string[];
  declare corsAllowHeaders: string[];
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
