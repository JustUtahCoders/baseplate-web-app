import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Role').RoleModel, import('./Role').RoleAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  humanReadableName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requiresEntityId: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  customerOrgId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  deprecationDate: {
    type: DataTypes.DATE,
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
