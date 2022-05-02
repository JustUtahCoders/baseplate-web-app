import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { PermissionModel } from "./Permission";
import { RoleModel } from "./Role";
import { currentSchema } from "./RolePermissionSchema";

export class RolePermissionModel
  extends Model<RolePermissionAttributes, RolePermissionCreationAttributes>
  implements
    RolePermissionAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ role: RoleModel; permission: PermissionModel }>
{
  public id!: BaseplateUUID;
  public permissionId!: string;
  public roleId!: string;
  public dateRevoked?: Date;

  public getRole!: BelongsToGetAssociationMixin<RoleModel>;
  public setRole!: BelongsToSetAssociationMixin<RoleModel, number>;
  public createRole!: BelongsToCreateAssociationMixin<RoleModel>;

  public getPermission!: BelongsToGetAssociationMixin<PermissionModel>;
  public setPermission!: BelongsToSetAssociationMixin<PermissionModel, number>;
  public createPermission!: BelongsToCreateAssociationMixin<PermissionModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt: Date;
}

export interface RolePermissionAttributes {
  id: BaseplateUUID;
  permissionId: BaseplateUUID;
  roleId: BaseplateUUID;
  dateRevoked?: Date;
}

export type RolePermissionCreationAttributes = Omit<
  RolePermissionAttributes,
  "id"
>;

export type RolePermission = RolePermissionAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  RolePermissionModel.init(currentSchema, {
    sequelize,
    modelName: "RolePermission",
  });
});

modelEvents.once("associate", () => {
  RolePermissionModel.belongsTo(RoleModel, {
    as: "role",
    foreignKey: "id",
  });

  RolePermissionModel.belongsTo(PermissionModel, {
    as: "permission",
    foreignKey: "id",
  });
});
