import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./AccountPermission').AccountPermissionModel, import('./AccountPermission').AccountPermissionAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  customerOrgId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
    // No foreign key here because it could reference either Users or AuthTokens table
  },
  auditAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
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
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    // No foreign key here because it could reference any of many tables
  },
  dateRevoked: {
    type: DataTypes.DATE,
    allowNull: true,
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
