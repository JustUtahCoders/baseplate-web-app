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
  public id!: BaseplateUUID;
  public name!: string;
  public humanReadableName!: string;
  public description!: string;
  public deprecationDate!: Date;
  public requiresEntityId!: boolean;
  public auditAccountId!: string;
  public customerOrgId?: BaseplateUUID;

  public getPermissions!: BelongsToManyGetAssociationsMixin<PermissionModel>;
  public countPermissions!: BelongsToManyCountAssociationsMixin;
  public hasPermission!: BelongsToManyHasAssociationMixin<
    PermissionModel,
    number
  >;
  public hasPermissions!: BelongsToManyHasAssociationsMixin<
    PermissionModel,
    number
  >;
  public setPermissions!: BelongsToManySetAssociationsMixin<
    PermissionModel,
    number
  >;
  public addPermission!: BelongsToManyAddAssociationMixin<
    PermissionModel,
    number
  >;
  public addPermissions!: BelongsToManyAddAssociationsMixin<
    PermissionModel,
    number
  >;
  public removePermission!: BelongsToManyRemoveAssociationMixin<
    PermissionModel,
    number
  >;
  public removePermissions!: BelongsToManyRemoveAssociationsMixin<
    PermissionModel,
    number
  >;
  public createPermission!: BelongsToManyCreateAssociationMixin<PermissionModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt: Date;
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
