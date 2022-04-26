import S, { ModelStatic } from "sequelize";
import { modelEvents } from "../../../InitDB";
import { BaseplateUUID } from "../SequelizeTSHelpers";
import { sequelizeOptions } from "./AuditInit";

const { DataTypes, Model } = S;

export class AuditModel<ModelAttributes> extends Model<
  AuditAttributes<ModelAttributes>,
  AuditCreationAttributes<ModelAttributes>
> {
  public id!: BaseplateUUID;
  public auditUserId!: BaseplateUUID;
  public auditItemId!: BaseplateUUID;
  public auditTimestamp!: Date;
  public oldRowData: Partial<ModelAttributes>;
  public newRowData: Partial<ModelAttributes>;
}

export interface AuditAttributes<ModelAttributes> {
  id: BaseplateUUID;
  auditUserId: BaseplateUUID;
  auditItemId: BaseplateUUID;
  auditEventType: string;
  auditTimestamp: Date;
  oldRowData: Partial<ModelAttributes>;
  newRowData: Partial<ModelAttributes>;
}

export interface AuditTargetAttributes {
  auditUserId: BaseplateUUID;
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
