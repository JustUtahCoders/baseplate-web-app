import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./DeployedMicrofrontend').DeployedMicrofrontendModel, import('./DeployedMicrofrontend').DeployedMicrofrontendAttributes>}
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
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  microfrontendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Microfrontends",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  deploymentChangedMicrofrontend: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  bareImportSpecifier: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entryUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  trailingSlashUrl: {
    type: DataTypes.STRING,
    allowNull: false,
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
