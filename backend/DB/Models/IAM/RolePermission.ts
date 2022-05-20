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
  declare id: BaseplateUUID;
  declare permissionId: string;
  declare roleId: string;
  declare dateRevoked: Date;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getRole: BelongsToGetAssociationMixin<RoleModel>;
  declare setRole: BelongsToSetAssociationMixin<RoleModel, number>;
  declare createRole: BelongsToCreateAssociationMixin<RoleModel>;

  declare getPermission: BelongsToGetAssociationMixin<PermissionModel>;
  declare setPermission: BelongsToSetAssociationMixin<PermissionModel, number>;
  declare createPermission: BelongsToCreateAssociationMixin<PermissionModel>;
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
