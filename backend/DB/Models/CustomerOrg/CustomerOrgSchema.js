import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./CustomerOrg').CustomerOrgModel, import('./CustomerOrg').CustomerOrgAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  billingUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  orgKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
