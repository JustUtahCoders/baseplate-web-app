import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./RolePermission').RolePermissionModel, import('./RolePermission').RolePermissionAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Permissions",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Roles",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: S.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: S.literal("CURRENT_TIMESTAMP"),
  },
};

export const initialSchema = schema;

export const currentSchema = schema;
