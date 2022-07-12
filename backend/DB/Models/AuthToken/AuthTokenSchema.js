import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./AuthToken').AuthTokenModel, import('./AuthToken').AuthTokenAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  authTokenType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secretAccessKey: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  customerOrgId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dateRevoked: {
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
