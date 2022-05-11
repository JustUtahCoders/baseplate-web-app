import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./StaticWebSettings').StaticWebSettingsModel, import('./StaticWebSettings').StaticWebSettingsAttributes>}
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
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  defaultCacheControl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  importMapCacheControl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  corsAllowOrigins: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  corsExposeHeaders: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  corsMaxAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  corsAllowCredentials: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  corsAllowMethods: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  corsAllowHeaders: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  auditAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
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
