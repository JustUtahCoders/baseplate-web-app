import {
  BelongsToGetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToSetAssociationMixin,
  Model,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { currentSchema } from "./AccountRoleSchema";
import { RoleModel } from "./Role";

export class AccountRoleModel
  extends Model<AccountRoleAttributes, AccountRoleCreationAttributes>
  implements AccountRole, BelongsToMethods<{ role: RoleModel }>
{
  public id!: BaseplateUUID;
  public customerOrgId!: BaseplateUUID;
  public accountId!: BaseplateUUID;
  public roleId!: BaseplateUUID;
  public entityId?: BaseplateUUID;
  public dateRevoked?: Date;
  public auditAccountId!: BaseplateUUID;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getRole!: BelongsToGetAssociationMixin<RoleModel>;
  public setRole!: BelongsToSetAssociationMixin<RoleModel, number>;
  public createRole!: BelongsToCreateAssociationMixin<RoleModel>;
}

export interface AccountRoleAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
  accountId: BaseplateUUID;
  roleId: BaseplateUUID;
  entityId?: BaseplateUUID;
  dateRevoked?: Date;
}

export type AccountRoleCreationAttributes = Omit<AccountRoleAttributes, "id">;

export type AccountRole = AccountRoleAttributes & DefaultModelAttrs;

export class AccountRoleAuditModel extends AuditModel<AccountRoleAttributes> {}

const modelName = "AccountRoles";

initAuditModel(AccountRoleAuditModel, AccountRoleModel, modelName);

modelEvents.once("init", (sequelize) => {
  AccountRoleModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", () => {
  AccountRoleModel.belongsTo(RoleModel, {
    as: "role",
    foreignKey: "id",
  });
});
