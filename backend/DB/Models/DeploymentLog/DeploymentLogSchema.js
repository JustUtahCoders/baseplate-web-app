import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./DeploymentLog').DeploymentLogModel, import('./DeploymentLog').DeploymentLogAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deploymentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Deployments",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
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
