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
  public id!: BaseplateUUID;
  public auditAccountId!: BaseplateUUID;
  public auditItemId!: BaseplateUUID;
  public auditTimestamp!: Date;
  public auditEventType!: string;
  public oldRowData: Partial<ModelAttributes>;
  public newRowData: Partial<ModelAttributes>;
}

export interface AuditAttributes<ModelAttributes> {
  id: BaseplateUUID;
  auditAccountId: BaseplateUUID;
  auditItemId: BaseplateUUID;
  auditEventType: string;
  auditTimestamp: Date;
  oldRowData: Partial<ModelAttributes>;
  newRowData: Partial<ModelAttributes>;
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

    ThisModel.init(auditInitOptions, {
      sequelize,
      timestamps: false,
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
