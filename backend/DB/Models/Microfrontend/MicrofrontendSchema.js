import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Microfrontend').MicrofrontendModel, import('./Microfrontend').MicrofrontendAttributes>}
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
    allowNull: false,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scope: {
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
  useCustomerOrgKeyAsScope: {
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
