import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Environment').EnvironmentModel, import('./Environment').EnvironmentAttributes>}
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
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    allowNull: false,
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isProd: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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
