import {
  Model,
  HasManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
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

  public getPermissions!: HasManyGetAssociationsMixin<PermissionModel>;
  public countPermissions!: HasManyCountAssociationsMixin;
  public hasPermission!: HasManyHasAssociationMixin<PermissionModel, number>;
  public hasPermissions!: HasManyHasAssociationsMixin<PermissionModel, number>;
  public setPermissions!: HasManySetAssociationsMixin<PermissionModel, number>;
  public addPermission!: HasManyAddAssociationMixin<PermissionModel, number>;
  public addPermissions!: HasManyAddAssociationsMixin<PermissionModel, number>;
  public removePermission!: HasManyRemoveAssociationMixin<
    PermissionModel,
    number
  >;
  public removePermissions!: HasManyRemoveAssociationsMixin<
    PermissionModel,
    number
  >;
  public createPermission!: HasManyCreateAssociationMixin<PermissionModel>;

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
  RoleModel.hasMany(PermissionModel, {
    as: "permission",
    foreignKey: "roleId",
  });
});
