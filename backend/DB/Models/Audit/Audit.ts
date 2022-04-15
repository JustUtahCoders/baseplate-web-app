import S, { ModelStatic } from "sequelize";
import { modelEvents } from "../../../InitDB";
import { sequelizeOptions } from "./AuditInit";

const { DataTypes, Model } = S;

export class AuditModel<ModelAttributes> extends Model<
  AuditAttributes<ModelAttributes>,
  AuditCreationAttributes<ModelAttributes>
> {
  public id!: number;
  public auditUserId!: number;
  public auditItemId!: number;
  public auditTimestamp!: Date;
  public oldRowData: Partial<ModelAttributes>;
  public newRowData: Partial<ModelAttributes>;
}

export interface AuditAttributes<ModelAttributes> {
  id: number;
  auditUserId: number;
  auditItemId: number;
  auditEventType: string;
  auditTimestamp: Date;
  oldRowData: Partial<ModelAttributes>;
  newRowData: Partial<ModelAttributes>;
}

export interface AuditTargetAttributes {
  auditUserId: number;
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
