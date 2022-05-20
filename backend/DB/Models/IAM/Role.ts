import {
  Model,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, HasManyMethods } from "../SequelizeTSHelpers";
import { PermissionModel } from "./Permission";
import { currentSchema } from "./RoleSchema";

export class RoleModel
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements
    RoleAttributes,
    DefaultModelAttrs,
    HasManyMethods<{ permission: PermissionModel }>
{
  declare id: BaseplateUUID;
  declare name: string;
  declare humanReadableName: string;
  declare description: string;
  declare deprecationDate: Date;
  declare requiresEntityId: boolean;
  declare auditAccountId: string;
  declare customerOrgId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getPermissions: BelongsToManyGetAssociationsMixin<PermissionModel>;
  declare countPermissions: BelongsToManyCountAssociationsMixin;
  declare hasPermission: BelongsToManyHasAssociationMixin<
    PermissionModel,
    number
  >;
  declare hasPermissions: BelongsToManyHasAssociationsMixin<
    PermissionModel,
    number
  >;
  declare setPermissions: BelongsToManySetAssociationsMixin<
    PermissionModel,
    number
  >;
  declare addPermission: BelongsToManyAddAssociationMixin<
    PermissionModel,
    number
  >;
  declare addPermissions: BelongsToManyAddAssociationsMixin<
    PermissionModel,
    number
  >;
  declare removePermission: BelongsToManyRemoveAssociationMixin<
    PermissionModel,
    number
  >;
  declare removePermissions: BelongsToManyRemoveAssociationsMixin<
    PermissionModel,
    number
  >;
  declare createPermission: BelongsToManyCreateAssociationMixin<PermissionModel>;
}

export interface RoleAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  name: string;
  humanReadableName: string;
  description: string;
  customerOrgId?: BaseplateUUID;
  requiresEntityId: boolean;
  deprecationDate: Date;
}

export type RoleCreationAttributes = Omit<RoleAttributes, "id">;

export type Role = RoleAttributes & DefaultModelAttrs;

export class RoleAuditModel extends AuditModel<RoleAttributes> {}

const modelName = "Role";

initAuditModel(RoleAuditModel, RoleModel, modelName);

modelEvents.once("init", (sequelize) => {
  RoleModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", (sequelize) => {
  RoleModel.belongsToMany(PermissionModel, {
    through: "RolePermissions",
    as: "permissions",
    foreignKey: "roleId",
  });
});
