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
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare accountId: BaseplateUUID;
  declare roleId: BaseplateUUID;
  declare entityId: BaseplateUUID;
  declare dateRevoked: Date;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getRole: BelongsToGetAssociationMixin<RoleModel>;
  declare setRole: BelongsToSetAssociationMixin<RoleModel, number>;
  declare createRole: BelongsToCreateAssociationMixin<RoleModel>;
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
