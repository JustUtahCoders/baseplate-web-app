import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Deployment').DeploymentModel, import('./Deployment').DeploymentAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
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
  baseplateTokenId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "AuthTokens",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  cause: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  environmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Environments",
      key: "id",
    },
  },
  auditAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
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
