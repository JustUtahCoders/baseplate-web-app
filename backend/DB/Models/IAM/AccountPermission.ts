import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { currentSchema } from "./AccountPermissionSchema";
import { PermissionModel } from "./Permission";

export class AccountPermissionModel
  extends Model<
    AccountPermissionAttributes,
    AccountPermissionCreationAttributes
  >
  implements
    AccountPermissionAttributes,
    BelongsToMethods<{ permission: PermissionModel }>
{
  public id!: BaseplateUUID;
  public customerOrgId!: BaseplateUUID;
  public accountId!: BaseplateUUID;
  public permissionId!: BaseplateUUID;
  public entityId: BaseplateUUID;
  public dateRevoked: Date;
  public auditAccountId!: BaseplateUUID;

  public getPermission!: BelongsToGetAssociationMixin<PermissionModel>;
  public setPermission!: BelongsToSetAssociationMixin<PermissionModel, number>;
  public createPermission!: BelongsToCreateAssociationMixin<PermissionModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface AccountPermissionAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  accountId: BaseplateUUID;
  permissionId: BaseplateUUID;
  entityId?: BaseplateUUID;
  dateRevoked?: Date;
}

export type AccountPermissionCreationAttributes = Omit<
  AccountPermissionAttributes,
  "id"
>;

export type AccountPermission = AccountPermissionAttributes & DefaultModelAttrs;

export class AccountPermissionAuditModel extends AuditModel<AccountPermissionAttributes> {}

const modelName = "AccountPermissions";

initAuditModel(AccountPermissionAuditModel, AccountPermissionModel, modelName);

modelEvents.once("init", (sequelize) => {
  AccountPermissionModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", () => {
  AccountPermissionModel.belongsTo(PermissionModel, {
    as: "permission",
    foreignKey: "permissionId",
  });
});
