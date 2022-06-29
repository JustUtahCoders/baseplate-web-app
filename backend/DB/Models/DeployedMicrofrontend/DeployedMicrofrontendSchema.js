import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./DeployedMicrofrontend').DeployedMicrofrontendModel, import('./DeployedMicrofrontend').DeployedMicrofrontendAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  deploymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Deployments",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  microfrontendId: {
    type: DataTypes.UUID,
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
    allowNull: true,
  },
  alias1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alias2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alias3: {
    type: DataTypes.STRING,
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
