import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Deployment').DeploymentModel, import('./Deployment').DeploymentAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  baseplateTokenId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "JWTs",
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
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Environments",
      key: "id",
    },
  },
  auditUserId: {
    type: DataTypes.INTEGER,
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
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

export const initialSchema = schema;

export const currentSchema = schema;
