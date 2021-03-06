import { ModelStatic, Model } from "sequelize";
import { modelEvents } from "../../../InitDB";
import { BaseplateUUID } from "../SequelizeTSHelpers";
import { sequelizeOptions } from "./AuditInit";

export class AuditModel<ModelAttributes>
  extends Model<
    AuditAttributes<ModelAttributes>,
    AuditCreationAttributes<ModelAttributes>
  >
  implements AuditAttributes<ModelAttributes>
{
  declare id: BaseplateUUID;
  declare auditAccountId: BaseplateUUID;
  declare auditItemId: BaseplateUUID;
  declare auditTimestamp: Date;
  declare auditEventType: "INSERT" | "UPDATE" | "DELETE";
  declare oldRowData: Partial<ModelAttributes> | null;
  declare newRowData: Partial<ModelAttributes> | null;
}

export interface AuditAttributes<ModelAttributes> {
  id: BaseplateUUID;
  auditAccountId: BaseplateUUID;
  auditItemId: BaseplateUUID;
  auditEventType: "INSERT" | "UPDATE" | "DELETE";
  auditTimestamp: Date;
  oldRowData: Partial<ModelAttributes> | null;
  newRowData: Partial<ModelAttributes> | null;
}

export interface AuditTargetAttributes {
  auditAccountId: BaseplateUUID;
}

export type AuditCreationAttributes<ModelAttributes> = Omit<
  AuditAttributes<ModelAttributes>,
  "id"
>;

export type Audit<ModelAttributes> = AuditAttributes<ModelAttributes>;

export function initAuditModel(
  SpecificAuditModel: any,
  ParentModel: ModelStatic<any>,
  parentModelName: string
): void {
  const ThisModel = SpecificAuditModel as typeof AuditModel;

  modelEvents.once("init", (sequelize) => {
    const auditInitOptions = sequelizeOptions(parentModelName);

    const parentModelSuffix = parentModelName.endsWith("s") ? "" : "s";
    const tableName = parentModelName + parentModelSuffix + "Audit";

    ThisModel.init(auditInitOptions, {
      sequelize,
      timestamps: false,
      modelName: tableName,
      tableName,
    });
  });

  modelEvents.once("associate", (sequelize) => {
    ThisModel.belongsTo(ParentModel, {
      foreignKey: {
        name: "auditItemId",
        allowNull: false,
      },
    });
  });
}
