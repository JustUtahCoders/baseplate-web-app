import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Environment').EnvironmentModel, import('./Environment').EnvironmentAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerOrgId: {
    type: DataTypes.INTEGER,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isProd: {
    type: DataTypes.BOOLEAN,
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
